package com.endo4life.service.file;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.junrar.Archive;
import com.github.junrar.exception.RarException;
import com.github.junrar.rarfile.FileHeader;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.domain.dto.ExtractedFile;
import com.endo4life.service.minio.MinioService;
import com.endo4life.utils.FileUtil;
import com.endo4life.utils.ResourceUtil;
import com.endo4life.web.rest.errors.FileUploadFailedException;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceState;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import java.util.Enumeration;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    private final Executor taskExecutor;
    private final MinioService minioService;
    private final ApplicationProperties applicationProperties;
    private ApplicationProperties.MinioConfiguration minioConfig;

    public FileServiceImpl(@Qualifier("taskExecutor") Executor taskExecutor,
                           MinioService minioService,
                           ApplicationProperties applicationProperties) {
        this.taskExecutor = taskExecutor;
        this.minioService = minioService;
        this.applicationProperties = applicationProperties;
    }

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public void deleteUploadedFiles(Collection<String> fileNames, Collection<String> bucketNames) {
        if (bucketNames.size() == 1 && CollectionUtils.isNotEmpty(fileNames)) {
            log.info("Deleting uploaded files: {}", fileNames);
            fileNames.forEach(
                    file -> taskExecutor.execute(
                            () -> minioService.removeFile(file,
                                    bucketNames.stream().findFirst().orElse(null))));
        } else if (CollectionUtils.isNotEmpty(fileNames) && CollectionUtils.isNotEmpty(
                bucketNames)) {
            List<String> fileNamesList = new ArrayList<>(fileNames); // Ensure indexed access
            List<String> bucketNamesList = new ArrayList<>(bucketNames);
            IntStream.range(0, Math.min(fileNamesList.size(), bucketNamesList.size()))
                    .forEachOrdered(i -> taskExecutor.execute(
                            () -> minioService.removeFile(fileNamesList.get(i), bucketNamesList.get(i))));
        }
    }

    @SneakyThrows
    @Override
    public Map<ExtractedFile, CreateResourceRequestDto> processCompressedFile(MultipartFile file) {
        Map<ExtractedFile, CreateResourceRequestDto> fileDtoMap = new LinkedHashMap<>();
        String fileExtension = FileUtil.getCompressedFileExtension(file.getOriginalFilename());
        File tempFile = File.createTempFile("compressed", fileExtension);

        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());

            // Process based on the file type (ZIP or RAR)
            if (".zip".equals(fileExtension)) {
                processZipFile(tempFile, fileDtoMap);
            } else if (".rar".equals(fileExtension)) {
                processRarFile(tempFile, fileDtoMap);
            }

            FileUtil.deleteFile(tempFile); // Cleanup temporary file
        } catch (IOException e) {
            log.error("Failed to process compressed file: {}", e.getMessage());
        }

        return fileDtoMap;
    }

    private void processZipFile(File tempFile,
            Map<ExtractedFile, CreateResourceRequestDto> extractedFileMap) {
        try (ZipFile zipFile = new ZipFile(tempFile)) {
            Enumeration<ZipArchiveEntry> entries = zipFile.getEntries();

            // Identify and process the CSV file first
            Optional<ZipArchiveEntry> csvEntry = findCsvEntry(entries);
            if (csvEntry.isPresent()) {
                InputStream csvStream = zipFile.getInputStream(csvEntry.get());
                Map<String, CreateResourceRequestDto> fileMetadataMap = processCsv(csvStream);

                // Process other files and map to metadata
                processNonCsvEntries(zipFile, fileMetadataMap, extractedFileMap);
            }
        } catch (IOException e) {
            log.error("Failed to process ZIP file: {}", e.getMessage());
        }
    }

    private Optional<ZipArchiveEntry> findCsvEntry(Enumeration<ZipArchiveEntry> entries) {
        return Collections.list(entries).stream()
                .filter(entry -> entry.getName().endsWith(".csv"))
                .findFirst();
    }

    private void processNonCsvEntries(ZipFile zipFile,
            Map<String, CreateResourceRequestDto> fileMetadataMap,
            Map<ExtractedFile, CreateResourceRequestDto> fileDtoMap) {
        Collections.list(zipFile.getEntries()).stream()
                .filter(entry -> !entry.getName().endsWith(".csv"))
                .forEach(entry -> processZipEntry(zipFile, entry, fileMetadataMap, fileDtoMap));
    }

    private void processRarFile(File rarFile,
            Map<ExtractedFile, CreateResourceRequestDto> fileDtoMap) {
        try (Archive archive = new Archive(rarFile)) {
            if (archive.isEncrypted()) {
                throw new IOException("Cannot process encrypted RAR files.");
            }

            Map<String, CreateResourceRequestDto> fileMetadataMap = new HashMap<>();
            FileHeader fileHeader;

            // Iterate over RAR entries
            while ((fileHeader = archive.nextFileHeader()) != null) {
                if (!fileHeader.isDirectory()) {
                    processRarEntry(archive, fileHeader, fileMetadataMap, fileDtoMap);
                }
            }
        } catch (IOException | RarException e) {
            log.error("Failed to process RAR file: {}", e.getMessage());
        }
    }

    private void processRarEntry(Archive archive, FileHeader fileHeader,
            Map<String, CreateResourceRequestDto> fileMetadataMap,
            Map<ExtractedFile, CreateResourceRequestDto> fileDtoMap) {
        String fileName = fileHeader.getFileNameString().trim();

        try (InputStream fileStream = archive.getInputStream(fileHeader)) {
            if (fileName.endsWith(".csv")) {
                fileMetadataMap = processCsv(fileStream);
            } else if (fileMetadataMap.containsKey(fileName)) {
                MultipartFile multipartFile = new MockMultipartFile(
                        fileName, fileName, getContentType(fileName), fileStream);
                fileDtoMap.put(ExtractedFile.builder().file(multipartFile).build(),
                        fileMetadataMap.get(fileName));
            }
        } catch (IOException e) {
            log.error("Error processing RAR entry: {}", e.getMessage());
        }
    }

    private String getContentType(String fileName) {
        if (fileName.endsWith(".mp4")) {
            return "video/mp4";
        }
        if (fileName.endsWith(".avi")) {
            return "video/x-msvideo";
        }
        if (fileName.endsWith(".mkv")) {
            return "video/x-matroska";
        }
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        return null; // Default or unknown content type
    }

    private Map<String, CreateResourceRequestDto> processCsv(InputStream csvStream)
            throws IOException {
        Map<String, CreateResourceRequestDto> fileMetadataMap = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(csvStream, StandardCharsets.UTF_8))) {

            // Read the first line and handle BOM if present
            String firstLine = reader.readLine();
            if (firstLine != null && firstLine.startsWith("\uFEFF")) {
                firstLine = firstLine.substring(1); // Remove BOM
            }

            // Determine if the CSV is in single-column or multi-column format
            boolean isSingleColumnFormat = firstLine.split(",").length > 1;

            if (isSingleColumnFormat) {
                processSingleColumnCsv(reader, fileMetadataMap, firstLine);
            } else {
                processMultiColumnCsv(reader, fileMetadataMap, firstLine);
            }
        }
        return fileMetadataMap;
    }

    // Method to process single-column CSV format
    private void processSingleColumnCsv(BufferedReader reader,
            Map<String, CreateResourceRequestDto> fileMetadataMap,
            String firstLine) throws IOException {

        // Skip the header row if it matches known header names
        if (firstLine.trim().equalsIgnoreCase("fileName,title,description,state")) {
            firstLine = reader.readLine(); // Read the next line after the header
        }

        String line = firstLine;
        do {
            String[] values = line.split(",");

            if (values.length >= 1) {
                String fileName = values[0].trim();
                String title = (values.length > 1 && !values[1].isEmpty()) ? values[1].trim() : null;
                String description = (values.length > 2 && !values[2].isEmpty()) ? values[2].trim() : null;
                String state = (values.length > 3) ? values[3].trim() : null;

                log.info("Extracting file with metadata: [{},{},{},{}]", fileName, title,
                        description, state);
                if (state == null) {
                    log.warn("State is missing for file: {}", fileName);
                    continue; // Skip this entry if state is missing
                }

                CreateResourceRequestDto dto = new CreateResourceRequestDto();
                dto.setTitle(title); // Can be null
                dto.setDescription(description); // Can be null
                dto.setState(ResourceState.valueOf(state.toUpperCase()));

                fileMetadataMap.put(fileName, dto);
            } else {
                log.warn("Skipped line due to insufficient data: {}", line);
            }
        } while ((line = reader.readLine()) != null);
    }

    // Method to process multi-column CSV format
    private void processMultiColumnCsv(BufferedReader reader,
            Map<String, CreateResourceRequestDto> fileMetadataMap,
            String firstLine) throws IOException {

        // Parse the multi-column CSV file with a semicolon delimiter
        CSVParser csvParser = CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withDelimiter(';')
                .parse(new StringReader(
                        firstLine + "\n" + reader.lines().collect(Collectors.joining("\n"))));
        log.info("csv parsed: {}", csvParser);
        for (CSVRecord record : csvParser) {
            log.info("record: {}", record);
            String fileName = record.get("fileName");
            String title = record.get("title");
            String description = record.get("description");
            String state = record.get("state");
            log.info("Extracting file with metadata: [{},{},{},{}]", fileName, title,
                    description, state);
            CreateResourceRequestDto dto = new CreateResourceRequestDto();
            dto.setTitle(title);
            dto.setDescription(description); // Can be null
            dto.setState(ResourceState.valueOf(state.toUpperCase()));

            fileMetadataMap.put(fileName, dto);
        }
    }

    private void processZipEntry(ZipFile zipFile, ZipArchiveEntry zipEntry,
            Map<String, CreateResourceRequestDto> fileMetadataMap,
            Map<ExtractedFile, CreateResourceRequestDto> extractedFileMap) {
        try (InputStream inputStream = zipFile.getInputStream(zipEntry)) {

            String fileName = zipEntry.getName();
            if (fileName.startsWith("__MACOSX") || fileName.startsWith("._")) {
                log.info("Skipping macOS metadata file: {}", fileName);
                return;
            }
            String baseFileName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.'))
                    : fileName;
            String keyFileName = fileName.contains("/") ? fileName.substring(fileName.lastIndexOf('/') + 1)
                    : fileName;
            // Process image/video files
            if (fileMetadataMap.containsKey(keyFileName)) {
                MultipartFile multipartFile = new MockMultipartFile(
                        keyFileName, keyFileName, getContentType(keyFileName), inputStream);

                // Check if JSON file exists for this entry
                ZipArchiveEntry jsonEntry = zipFile.getEntry(baseFileName + ".json");
                List<String> tags = new ArrayList<>();
                if (jsonEntry != null) {
                    try (InputStream jsonStream = zipFile.getInputStream(jsonEntry)) {
                        tags = extractTagsFromJson(
                                jsonStream); // Use updated method to extract display names
                    }
                }

                // Create and map the ExtractedFile, even if JSON doesn't exist
                ExtractedFile extractedFile = ExtractedFile.builder()
                        .file(multipartFile)
                        .tag(tags) // Will be an empty list if no JSON file exists
                        .build();

                extractedFileMap.put(extractedFile, fileMetadataMap.get(keyFileName));
            }
        } catch (IOException e) {
            log.error("Failed to process ZIP entry: {}", e.getMessage());
        }
    }

    private List<String> extractTagsFromJson(InputStream jsonStream) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();

        // Clean the input stream by removing control characters
        String cleanedJson = new BufferedReader(new InputStreamReader(jsonStream, StandardCharsets.UTF_8))
                .lines()
                .map(line -> line.replaceAll("[\\x00-\\x1F]", "")) // Remove control characters
                .collect(Collectors.joining("\n"));

        // Parse the cleaned JSON
        JsonNode rootNode = objectMapper.readTree(cleanedJson);
        JsonNode imageTagList = rootNode.get("image_tag_list");

        List<String> tags = new ArrayList<>();
        if (imageTagList != null && imageTagList.isArray()) {
            for (JsonNode tagNode : imageTagList) {
                String displayName = tagNode.get("display_name").asText();
                tags.add(displayName);
            }
        }
        log.info("extracted tags: {}", tags);
        return tags;
    }

    @Override
    public Set<String> uploadFiles(List<MultipartFile> files, UUID id, String bucketName) {
        if (CollectionUtils.isEmpty(files)) {
            return Collections.emptySet();
        }
        var features = files.stream().map(file -> {
            String fileName = id + Constants.UNDERSCORE + file.getOriginalFilename();
            return CompletableFuture.supplyAsync(
                    () -> minioService.uploadFile(file, bucketName, fileName),
                    taskExecutor).thenApply(v -> Pair.of(v, true)).exceptionally(e -> {
                        log.error("Failed to upload file: {}", fileName, e);
                        return Pair.of(fileName, false);
                    });
        }).toList();
        var uploadedResults = features
                .stream()
                .map(CompletableFuture::join)
                .collect(Collectors.groupingBy(
                        Pair::getValue,
                        Collectors.mapping(Pair::getKey, Collectors.toSet())));
        log.info("uploaded files: {}", uploadedResults);
        var uploadedFiles = uploadedResults.get(true);
        var failedToUploadFiles = uploadedResults.get(false);
        if (CollectionUtils.isNotEmpty(failedToUploadFiles)) {
            deleteUploadedFiles(failedToUploadFiles, bucketName);
            throw new FileUploadFailedException("Failed to upload your files: {0}",
                    String.join(Constants.COMMA, failedToUploadFiles));
        }
        return uploadedFiles;
    }

    @Override
    public void deleteUploadedFiles(final Collection<String> fileNames, String bucketName) {
        if (CollectionUtils.isNotEmpty(fileNames)) {
            log.info("Deleting uploaded files to bucket {} : {}", bucketName, fileNames);
            fileNames.forEach(
                    file -> taskExecutor.execute(() -> minioService.removeFile(file, bucketName)));
        }
    }

    @Override
    public void createAndUploadThumbnail(MultipartFile file,
            String dimension,
            String templateName) {
        String originalName = file.getOriginalFilename();
        // Strip extension if present (e.g., "uuid.png" -> "uuid")
        String baseName = originalName != null && originalName.contains(".") 
                ? originalName.substring(0, originalName.lastIndexOf("."))
                : originalName;
        String thumbnailName = templateName + baseName;
        MultipartFile thumbnail = FileUtil.toMultipartFile(
                ResourceUtil.generateThumbnail(file, dimension),
                thumbnailName,
                Constants.THUMBNAIL_CONTENT_TYPE);
        log.info("generate thumbnail with name: {}", thumbnailName);
        minioService.uploadFile(thumbnail, minioConfig.bucketThumbnail(), thumbnailName);
    }
}
