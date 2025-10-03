package com.endo4life.service.file;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.service.minio.MinioService;
import com.endo4life.utils.FileUtil;
import com.endo4life.utils.ResourceUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final MinioService minioService;
    private final ApplicationProperties applicationProperties;
    private ApplicationProperties.MinioConfiguration minioConfig;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public void createAndUploadThumbnail(MultipartFile file,
            String dimension,
            String templateName) {
        String thumbnailName = templateName + file.getOriginalFilename();
        MultipartFile thumbnail = FileUtil.toMultipartFile(
                ResourceUtil.generateThumbnail(file, dimension),
                thumbnailName,
                Constants.THUMBNAIL_CONTENT_TYPE);
        log.info("generate thumbnail with name: {}", thumbnailName);
        minioService.uploadFile(thumbnail, minioConfig.bucketThumbnail(), thumbnailName);
    }
}
