package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.api.MinioV1ApiDelegate;
import com.endo4life.web.rest.model.GeneratePreSignedUrlDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MinioV1ApiDelegateImpl implements MinioV1ApiDelegate {

    private final MinioService minioService;

    @Override
    @RoleAccess.Authenticated // Users need to be logged in to upload files
    public ResponseEntity<List<String>> generatePreSignedUrls(GeneratePreSignedUrlDto generatePreSignedUrlDto) {
        List<String> presignedUrls = minioService.generatePreSignedUrls(generatePreSignedUrlDto);
        return ResponseEntity.status(HttpStatus.OK).body(presignedUrls);
    }
}
