package com.endo4life.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.bytedeco.ffmpeg.avformat.AVFormatContext;
import org.bytedeco.ffmpeg.avutil.AVDictionary;
import org.bytedeco.ffmpeg.global.avformat;
import org.bytedeco.ffmpeg.global.avutil;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

@UtilityClass
@Slf4j
public class FileUtil {

    public MultipartFile toMultipartFile(byte[] bytes, String oriName, String contentType) {
        InputStream inputStream = new ByteArrayInputStream(bytes);
        return toMultipartFile(inputStream, oriName, contentType);
    }

    public MultipartFile toMultipartFile(InputStream inputStream, String oriName,
            String contentType) {
        MultipartFile multipartFile = null;
        try {
            String newExtension = contentType.substring(contentType.lastIndexOf("/") + 1);
            String newOriName;
            if (oriName.contains(".")) {
                // Has extension, replace it
                newOriName = oriName.substring(0, oriName.lastIndexOf(".")) + "." + newExtension;
            } else {
                // No extension, append it
                newOriName = oriName + "." + newExtension;
            }
            multipartFile = new MockMultipartFile("file", newOriName, contentType, inputStream);
        } catch (IOException e) {
            log.error("Failed to parse multipart file", e);
        }
        return multipartFile;
    }

    public String getFileExtension(String filename) {
        return Optional.of(filename.substring(filename.lastIndexOf(".") + 1)).orElse(null);
    }

    @SneakyThrows
    public static MultipartFile deepCopy(MultipartFile file) {
        byte[] fileContent = file.getBytes();

        return new MockMultipartFile(file.getName(), file.getOriginalFilename(),
                file.getContentType(), fileContent);
    }

    public int getVideoDuration(MultipartFile file) {
        File convFile = convertMultipartFileToFile(file);

        avutil.av_log_set_level(avutil.AV_LOG_QUIET);
        AVFormatContext formatContext = avformat.avformat_alloc_context();
        try {
            if (avformat.avformat_open_input(formatContext, convFile.getAbsolutePath(), null, null) != 0) {
                throw new IllegalStateException(
                        "Error opening video file: " + convFile.getAbsolutePath());
            }

            if (avformat.avformat_find_stream_info(formatContext, (AVDictionary) null) < 0) {
                throw new IllegalStateException(
                        "Error finding stream info for video file: " + convFile.getAbsolutePath());
            }
            return (int) (formatContext.duration() / avutil.AV_TIME_BASE);
        } catch (Exception e) {
            log.error("Failed to retrieve video duration: {}", e.getMessage(), e);
            return 0;
        } finally {
            if (formatContext != null) {
                avformat.avformat_close_input(formatContext);
            }
            deleteFile(convFile);
        }
    }

    public void deleteFile(File file) {
        Path path = Paths.get(file.getAbsolutePath());
        try {
            Files.delete(path);
            log.info("Deleted handled file: {}", path);
        } catch (IOException e) {
            log.error("Failed to delete handled file: {}. Error: {}", path, e.getMessage(), e);
        }
    }

    public String getCompressedFileExtension(String filename) {
        return (filename != null && filename.endsWith(".rar")) ? ".rar" : ".zip";
    }

    private File convertMultipartFileToFile(MultipartFile file) {
        File convFile = null;
        try {
            // Create temp file with proper extension
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".tmp";
            
            convFile = File.createTempFile("video_", extension);
            
            try (FileOutputStream fos = new FileOutputStream(convFile)) {
                fos.write(file.getBytes());
            }
        } catch (IOException e) {
            log.error("Failed to convert multipart file to file", e);
        }

        return convFile;
    }

}
