package com.endo4life.service.book;

import com.endo4life.domain.document.Book;
import com.endo4life.repository.BookRepository;
import com.endo4life.service.dto.BookDto;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.service.minio.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final MinioService minioService;
    private final MinioProperties minioProperties;

    @Override
    @Transactional
    public BookDto createBook(String title, String author, String description, MultipartFile file,
            MultipartFile cover) {
        log.info("Creating new book: {}", title);

        String fileUrl = null;
        String fileName = null;
        if (file != null && !file.isEmpty()) {
            fileName = minioService.uploadFile(file, minioProperties.getBucketBook());
            // Construct URL assuming public access or pre-signed requirement.
            // Based on existing code, we might store the full URL or just the object name.
            // The plan said "fileUrl" and "fileName".
            // MinioService.uploadFile returns the fileName (object name).
            // We can construct the URL using the endpoint and bucket.
            fileUrl = minioProperties.getEndpoint() + "/" + minioProperties.getBucketBook() + "/" + fileName;
        }

        String coverUrl = null;
        String coverName = null;
        if (cover != null && !cover.isEmpty()) {
            coverName = minioService.uploadFile(cover, minioProperties.getBucketImage());
            coverUrl = minioProperties.getEndpoint() + "/" + minioProperties.getBucketImage() + "/" + coverName;
        }

        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setFileUrl(fileUrl);
        book.setFileName(fileName);
        book.setCoverUrl(coverUrl);
        book.setCoverName(coverName);

        book = bookRepository.save(book);
        return mapToDto(book);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookDto> getBooks() {
        return bookRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookDto getBook(UUID id) {
        return bookRepository.findById(id)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public BookDto updateBook(UUID id, String title, String author, String description, MultipartFile file,
            MultipartFile cover) {
        log.info("Updating book with id: {}", id);
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);

        if (file != null && !file.isEmpty()) {
            // Delete old file if exists
            if (book.getFileName() != null) {
                try {
                    minioService.removeFile(book.getFileName(), minioProperties.getBucketBook());
                } catch (Exception e) {
                    log.error("Failed to delete old file: {}", book.getFileName(), e);
                }
            }
            // Upload new file
            String fileName = minioService.uploadFile(file, minioProperties.getBucketBook());
            String fileUrl = minioProperties.getEndpoint() + "/" + minioProperties.getBucketBook() + "/" + fileName;
            book.setFileName(fileName);
            book.setFileUrl(fileUrl);
        }

        if (cover != null && !cover.isEmpty()) {
            // Delete old cover if exists
            if (book.getCoverName() != null) {
                try {
                    minioService.removeFile(book.getCoverName(), minioProperties.getBucketImage());
                } catch (Exception e) {
                    log.error("Failed to delete old cover: {}", book.getCoverName(), e);
                }
            }
            // Upload new cover
            String coverName = minioService.uploadFile(cover, minioProperties.getBucketImage());
            String coverUrl = minioProperties.getEndpoint() + "/" + minioProperties.getBucketImage() + "/" + coverName;
            book.setCoverName(coverName);
            book.setCoverUrl(coverUrl);
        }

        book = bookRepository.save(book);
        return mapToDto(book);
    }

    @Override
    @Transactional
    public void deleteBook(UUID id) {
        log.info("Deleting book with id: {}", id);
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getFileName() != null) {
            try {
                minioService.removeFile(book.getFileName(), minioProperties.getBucketBook());
            } catch (Exception e) {
                log.error("Failed to delete file from MinIO: {}", book.getFileName(), e);
            }
        }

        if (book.getCoverName() != null) {
            try {
                minioService.removeFile(book.getCoverName(), minioProperties.getBucketImage());
            } catch (Exception e) {
                log.error("Failed to delete cover from MinIO: {}", book.getCoverName(), e);
            }
        }

        bookRepository.delete(book);
    }

    private BookDto mapToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setFileUrl(book.getFileUrl());
        dto.setCoverUrl(book.getCoverUrl());
        return dto;
    }
}
