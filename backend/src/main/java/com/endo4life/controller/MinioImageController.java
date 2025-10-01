package com.endo4life.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.endo4life.service.minio.MinioProperties;
import com.endo4life.service.minio.MinioService;

import java.util.List;

@RestController
@RequestMapping("/api/images")
public class MinioImageController {

    private final MinioService minioService;
    private final MinioProperties minioProperties;

    public MinioImageController(MinioService minioService, MinioProperties minioProperties) {
        this.minioService = minioService;
        this.minioProperties = minioProperties;
    }

    // 🟢 1. Upload ảnh
    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws Exception {
        String fileName = minioService.uploadFile(minioProperties.getBucketImage(), file);
        return "Uploaded successfully: " + fileName;
    }

    // 🟢 2. Download ảnh
    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadImage(@PathVariable String fileName) throws Exception {
        byte[] data = minioService.downloadFile(minioProperties.getBucketImage(), fileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.IMAGE_JPEG) // hoặc IMAGE_PNG tùy file
                .body(data);
    }

    // 🟢 3. List/Search ảnh
    @GetMapping("/list")
    public List<String> listImages(@RequestParam(value = "prefix", required = false) String prefix) throws Exception {
        List<String> files = minioService.listFiles(minioProperties.getBucketImage());

        // Nếu có prefix → lọc file theo tên
        if (prefix != null && !prefix.isEmpty()) {
            return files.stream()
                    .filter(name -> name.toLowerCase().contains(prefix.toLowerCase()))
                    .toList();
        }

        return files;
    }

    // 🟢 4. Update ảnh (ghi đè file cũ bằng file mới)
    @PutMapping("/update/{fileName}")
    public String updateImage(
            @PathVariable String fileName,
            @RequestParam("file") MultipartFile newFile) throws Exception {

        String newFileName = minioService.updateFile(minioProperties.getBucketImage(), fileName, newFile);
        return "Updated successfully: " + newFileName;
    }
}
