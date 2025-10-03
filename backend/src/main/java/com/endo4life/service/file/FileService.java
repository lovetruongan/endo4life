package com.endo4life.service.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    void createAndUploadThumbnail(MultipartFile file,
            String dimension,
            String templateName);
}
