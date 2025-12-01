package com.endo4life.service.book;

import com.endo4life.service.dto.BookDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BookService {
    BookDto createBook(String title, String author, String description, MultipartFile file, MultipartFile cover);

    List<BookDto> getBooks();

    BookDto getBook(UUID id);

    BookDto updateBook(UUID id, String title, String author, String description, MultipartFile file,
            MultipartFile cover);

    void deleteBook(UUID id);
}
