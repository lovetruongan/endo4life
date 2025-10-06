package com.endo4life.mapper;

import com.endo4life.domain.document.QuestionAttachment;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.QuestionAttachmentResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Objects;
import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class QuestionAttachmentMapper {

    @Autowired
    private MinioService minioService;

    @Mapping(source = "attachment", target = "fileUrl", qualifiedByName = "attachmentToUrl")
    public abstract QuestionAttachmentResponseDto toQuestionAttachmentResponseDto(QuestionAttachment attachment);

    @Named("attachmentToUrl")
    String attachmentToUrl(QuestionAttachment attachment) {
        if (attachment == null || attachment.getObjectKey() == null || attachment.getBucket() == null) {
            return null;
        }
        return minioService.createGetPreSignedLink(attachment.getObjectKey().toString(), attachment.getBucket());
    }
}