package com.endo4life.service.book;

import com.endo4life.web.rest.model.BookResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BookService {
    BookResponseDto createBook(String title, String author, String description, MultipartFile file,
            MultipartFile cover);

    List<BookResponseDto> getBooks();

    BookResponseDto getBook(UUID id);

    BookResponseDto updateBook(UUID id, String title, String author, String description, MultipartFile file,
            MultipartFile cover);

    void deleteBook(UUID id);
}
