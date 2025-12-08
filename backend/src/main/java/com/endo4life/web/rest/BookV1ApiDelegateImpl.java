package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.book.BookService;
import com.endo4life.web.rest.api.BookV1ApiDelegate;
import com.endo4life.web.rest.model.BookResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BookV1ApiDelegateImpl implements BookV1ApiDelegate {

    private final BookService bookService;

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<List<BookResponseDto>> getBooks() {
        return ResponseEntity.ok(bookService.getBooks());
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<BookResponseDto> getBookById(UUID id) {
        BookResponseDto book = bookService.getBook(id);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(book);
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<BookResponseDto> createBook(String title, String author, String description,
            MultipartFile file, MultipartFile cover) {
        BookResponseDto book = bookService.createBook(title, author, description, file, cover);
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<BookResponseDto> updateBook(UUID id, String title, String author, String description,
            MultipartFile file, MultipartFile cover) {
        BookResponseDto book = bookService.updateBook(id, title, author, description, file, cover);
        return ResponseEntity.ok(book);
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<Void> deleteBook(UUID id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
