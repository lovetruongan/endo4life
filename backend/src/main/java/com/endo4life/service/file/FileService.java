package com.endo4life.service.file;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import com.endo4life.domain.dto.ExtractedFile;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    void deleteUploadedFiles(final Collection<String> fileName, Collection<String> bucketNames);

    Map<ExtractedFile, CreateResourceRequestDto> processCompressedFile(MultipartFile file);

    Set<String> uploadFiles(List<MultipartFile> files, UUID userId, String bucketName);

    void deleteUploadedFiles(final Collection<String> fileNames, String bucketName);

    void createAndUploadThumbnail(MultipartFile file,
            String dimension,
            String templateName);
}
