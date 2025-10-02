package com.endo4life.controller;

import com.endo4life.service.minio.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/minio")
@RequiredArgsConstructor
public class TestMinioController {

    private final MinioService minioService;

    /**
     * Upload file (auto generate file name)
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bucket") String bucket) {
        String fileName = minioService.uploadFile(file, bucket);
        return ResponseEntity.ok("Uploaded: " + fileName);
    }

    /**
     * Upload file với custom tên
     */
    @PostMapping("/upload/{fileName}")
    public ResponseEntity<String> uploadFileWithName(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bucket") String bucket,
            @PathVariable("fileName") String fileName) {
        String uploadedName = minioService.uploadFile(file, bucket, fileName);
        return ResponseEntity.ok("Uploaded with name: " + uploadedName);
    }

    /**
     * Download file
     */
    @GetMapping("/download/{bucket}/{fileName}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String bucket,
            @PathVariable String fileName) throws Exception {
        InputStream inputStream = minioService.getFile(bucket, fileName);
        byte[] fileBytes = inputStream.readAllBytes();
        inputStream.close();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileBytes);
    }

    /**
     * Update file (replace with new file and name)
     */
    @PutMapping("/update/{bucket}/{oldFileName}")
    public ResponseEntity<String> updateFile(
            @PathVariable String bucket,
            @PathVariable String oldFileName,
            @RequestParam("file") MultipartFile newFile,
            @RequestParam(value = "newName", required = false) String newName) {
        String updated = minioService.updateFile(bucket, oldFileName, newFile, newName);
        return ResponseEntity.ok("Updated: " + updated);
    }

    /**
     * Xóa 1 file
     */
    @DeleteMapping("/delete/{bucket}/{fileName}")
    public ResponseEntity<String> deleteFile(
            @PathVariable String bucket,
            @PathVariable String fileName) {
        minioService.removeFile(fileName, bucket);
        return ResponseEntity.ok("Deleted: " + fileName);
    }

    /**
     * Xóa nhiều file
     */
    @DeleteMapping("/delete-multi/{bucket}")
    public ResponseEntity<String> deleteFiles(
            @PathVariable String bucket,
            @RequestParam List<String> fileNames) {
        minioService.removeFiles(bucket, fileNames);
        return ResponseEntity.ok("Deleted files: " + fileNames);
    }

    /**
     * Tạo pre-signed URL GET
     */
    @GetMapping("/presigned/get/{bucket}/{fileName}")
    public ResponseEntity<String> getPreSignedUrl(
            @PathVariable String bucket,
            @PathVariable String fileName) {
        String url = minioService.createGetPreSignedLink(fileName, bucket);
        return ResponseEntity.ok(url);
    }

    /**
     * Tạo pre-signed URL PUT
     */
    @GetMapping("/presigned/put/{bucket}/{fileName}")
    public ResponseEntity<String> putPreSignedUrl(
            @PathVariable String bucket,
            @PathVariable String fileName) {
        String url = minioService.createPutPreSignedLink(fileName, bucket);
        return ResponseEntity.ok(url);
    }

    /**
     * Upload chunk (ví dụ video lớn)
     */
    // @PostMapping("/upload-chunk/{bucket}/{fileName}")
    // public ResponseEntity<String> uploadChunk(
    // @RequestParam("file") MultipartFile file,
    // @PathVariable String bucket,
    // @PathVariable String fileName) {
    // String uploaded = minioService.uploadChunk(file, bucket, fileName);
    // return ResponseEntity.ok("Chunk uploaded: " + uploaded);
    // }
}
