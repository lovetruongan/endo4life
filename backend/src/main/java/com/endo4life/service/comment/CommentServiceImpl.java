package com.endo4life.service.comment;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Comment;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.mapper.CommentMapper;
import com.endo4life.repository.CommentRepository;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.specifications.CommentSpecifications;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.user.UserInfoService;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.CommentCriteria;
import com.endo4life.web.rest.model.CommentResponseDto;
import com.endo4life.web.rest.model.CreateCommentRequestDto;
import com.endo4life.web.rest.model.UserInfoDto;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final UserInfoRepository userInfoRepository;
    private final MinioService minioService;
    private ApplicationProperties.MinioConfiguration minioConfig;
    private final ApplicationProperties applicationProperties;
    private final UserInfoService userInfoService;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public UUID createComment(CreateCommentRequestDto createCommentRequestDto) {
        Comment commentEntity = commentMapper.toComment(createCommentRequestDto);
        UUID courseId = createCommentRequestDto.getCourseId();
        if (Objects.nonNull(courseId)) {
            commentEntity.setCourse(
                    courseRepository.findById(createCommentRequestDto.getCourseId())
                            .orElseThrow(() -> new BadRequestException("Course not found with id {}", courseId)));
        }
        UUID resourceId = createCommentRequestDto.getResourceId();
        if (Objects.nonNull(resourceId)) {
            commentEntity.setResource(
                    resourceRepository.findById(createCommentRequestDto.getResourceId())
                            .orElseThrow(() -> new BadRequestException("Resource not found with id {}", resourceId)));
        }

        UserInfo userInfoEntity = userInfoRepository.findById(createCommentRequestDto.getUserInfoId())
                .orElseThrow(() -> new BadRequestException("UserInfo not found with id {}",
                        createCommentRequestDto.getUserInfoId()));
        commentEntity.setUser(userInfoEntity);
        if (CollectionUtils.isNotEmpty(createCommentRequestDto.getAttachments())) {
            commentEntity.setAttachments(createCommentRequestDto.getAttachments());
        }
        UUID parentId = createCommentRequestDto.getParentId();
        if (Objects.nonNull(parentId)) {
            Comment comment = commentRepository.findById(parentId)
                    .orElseThrow(() -> new BadRequestException("CommentEntity not found with id {}", parentId));
            commentEntity.setParentComment(comment);
        }
        commentEntity.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        commentEntity.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        commentRepository.save(commentEntity);
        return commentEntity.getId();
    }

    @Override
    public Page<CommentResponseDto> getComments(CommentCriteria criteria, Pageable pageable) {
        Set<String> setCreatedBy = new HashSet<>();
        Page<CommentResponseDto> result = commentRepository.findAll(
                CommentSpecifications.byCriteria(criteria), pageable)
                .map(commentEntity -> {
                    String createdBy = commentEntity.getCreatedBy();
                    if (StringUtils.isNotBlank(createdBy)) {
                        setCreatedBy.add(createdBy);
                    }
                    return commentMapper.toCommentResponseDto(commentEntity);
                });
        processUserInfoCreatedBy(result, setCreatedBy);
        return new PageImpl<>(
                result.getContent(),
                pageable,
                result.getTotalElements());
    }

    private void processUserInfoCreatedBy(Page<CommentResponseDto> result,
            Set<String> setCreatedBy) {
        Map<String, UserInfo> userInfoMap = userInfoService.getUserInfoByCreatedBy(setCreatedBy);
        if (MapUtils.isEmpty(userInfoMap)) {
            return;
        }
        result.getContent()
                .forEach(comment -> setCreatedByInfoRecursive(comment, userInfoMap));
    }

    private void setCreatedByInfoRecursive(CommentResponseDto comment, Map<String, UserInfo> userInfoMap) {
        String createdBy = comment.getCreatedBy();
        if (userInfoMap.containsKey(createdBy)) {
            UserInfo userInfo = userInfoMap.get(createdBy);
            UserInfoDto userInfoDto = convertToUserInfoDto(userInfo);
            comment.setCreatedByInfo(userInfoDto);
        }

        if (CollectionUtils.isNotEmpty(comment.getReplies())) {
            comment.getReplies().forEach(reply -> setCreatedByInfoRecursive(reply, userInfoMap));
        }
    }

    private UserInfoDto convertToUserInfoDto(UserInfo userInfoEntity) {
        UserInfoDto userInfoDto = new UserInfoDto();
        userInfoDto.setFirstName(userInfoEntity.getFirstName());
        userInfoDto.setLastName(userInfoEntity.getLastName());
        userInfoDto.setEmail(userInfoEntity.getEmail());
        userInfoDto.setAvatarUrl(
                minioService.createGetPreSignedLink(userInfoEntity.getAvatarPath(), minioConfig.bucketAvatar()));
        return userInfoDto;
    }
}
