package com.endo4life.web.rest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.service.comment.CommentService;
import com.endo4life.web.rest.api.CommentV1ApiDelegate;
import com.endo4life.web.rest.model.CommentCriteria;
import com.endo4life.web.rest.model.CommentResponseDto;
import com.endo4life.web.rest.model.CommentResponsePaginatedDto;
import com.endo4life.web.rest.model.CreateCommentRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.UpdateCommentRequestDto;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CommentV1ApiDelegateImpl implements CommentV1ApiDelegate {
    private final CommentService commentService;

    @Override
    public ResponseEntity<IdWrapperDto> createComment(CreateCommentRequestDto createCommentRequestDto) {
        UUID id = commentService.createComment(createCommentRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<CommentResponsePaginatedDto> getComments(CommentCriteria criteria,
            Pageable pageable) {
        var result = commentService.getComments(criteria, pageable);
        return ResponseEntity.ok(
                new CommentResponsePaginatedDto()
                        .data(result.getContent())
                        .total(result.getTotalElements()));
    }

    @Override
    public ResponseEntity<CommentResponseDto> updateComment(UUID id, UpdateCommentRequestDto updateCommentRequestDto) {
        CommentResponseDto result = commentService.updateComment(id, updateCommentRequestDto);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Void> deleteComment(UUID id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}