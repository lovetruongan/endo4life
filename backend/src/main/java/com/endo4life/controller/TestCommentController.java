package com.endo4life.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.endo4life.service.comment.CommentService;
import com.endo4life.web.rest.model.CommentCriteria;
import com.endo4life.web.rest.model.CommentResponseDto;
import com.endo4life.web.rest.model.CreateCommentRequestDto;

@RestController
@RequestMapping("/api/comments")
public class TestCommentController {
    @Autowired
    private CommentService commentService;

    /**
     * 🟢 API 1: Tạo mới comment
     * POST /api/comments
     */
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CreateCommentRequestDto requestDto) {
        UUID newCommentId = commentService.createComment(requestDto);
        return ResponseEntity.ok("Comment created successfully with ID: " + newCommentId);
    }

    /**
     * 🟢 API 2: Lấy danh sách comment có phân trang và lọc
     * GET /api/comments
     */
    @GetMapping
    public ResponseEntity<Page<CommentResponseDto>> getComments(
            CommentCriteria criteria,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        Page<CommentResponseDto> comments = commentService.getComments(criteria, pageable);
        return ResponseEntity.ok(comments);
    }
}
