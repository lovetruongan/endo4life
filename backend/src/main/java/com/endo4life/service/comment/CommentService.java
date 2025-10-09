package com.endo4life.service.comment;

import java.util.List;
import java.util.UUID;

import com.endo4life.web.rest.model.CommentCriteria;
import com.endo4life.web.rest.model.CommentResponseDto;
import com.endo4life.web.rest.model.CreateCommentRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
        UUID createComment(
                        CreateCommentRequestDto createCommentRequestDto);

        Page<CommentResponseDto> getComments(CommentCriteria criteria,
                        Pageable pageable);

}
