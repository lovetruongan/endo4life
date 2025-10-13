package com.endo4life.mapper;

import com.endo4life.domain.document.Comment;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CommentResponseDto;
import com.endo4life.web.rest.model.CreateCommentRequestDto;
import org.apache.commons.collections4.CollectionUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class CommentMapper {
    @Autowired
    private MinioService minioService;
    @Value("${spring.application.minio-configuration.bucket-image}")
    private String bucketImage;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "attachments", ignore = true)
    public abstract Comment toComment(CreateCommentRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    public abstract CommentResponseDto toCommentResponseDto(Comment comment);

    @AfterMapping
    protected void updateAttachmentUrls(@MappingTarget CommentResponseDto commentResponseDto, Comment commentEntity) {
        List<String> attachments = commentResponseDto.getAttachments();
        if (CollectionUtils.isEmpty(attachments)) {
            return;
        }
        List<String> attachmentUrls = new ArrayList<>();
        for (String attachment : attachments) {
            attachmentUrls.add(
                    minioService.createGetPreSignedLink(attachment, bucketImage));
        }
        commentResponseDto.setAttachments(attachmentUrls);
    }
}
