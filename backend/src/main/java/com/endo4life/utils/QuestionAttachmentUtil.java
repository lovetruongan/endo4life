package com.endo4life.utils;

import com.endo4life.domain.document.Question;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.QuestionAttachmentResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class QuestionAttachmentUtil {
    private final MinioService minioService;

    public List<QuestionAttachmentResponseDto> convertIntoQuestionAttachmentsDto(Question question) {
        if (question.getAttachments() == null) {
            return List.of();
        }

        return question.getAttachments().stream()
                .map(attachment -> {
                    QuestionAttachmentResponseDto dto = new QuestionAttachmentResponseDto();
                    dto.setId(attachment.getId());
                    dto.setFileName(attachment.getFileName());
                    dto.setFileType(attachment.getFileType());
                    dto.setFileSize(attachment.getFileSize());
                    dto.setWidth(attachment.getWidth());
                    dto.setHeight(attachment.getHeight());

                    // Generate presigned URL for file access
                    if (Objects.nonNull(attachment.getObjectKey()) && Objects.nonNull(attachment.getBucket())) {
                        String presignedUrl = minioService.createGetPreSignedLink(
                                attachment.getObjectKey().toString(),
                                attachment.getBucket());
                        dto.setFileUrl(presignedUrl);
                    }

                    return dto;
                }).collect(Collectors.toList());
    }
}
