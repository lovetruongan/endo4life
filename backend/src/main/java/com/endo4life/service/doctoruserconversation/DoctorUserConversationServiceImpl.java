package com.endo4life.service.doctoruserconversation;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.DoctorUserConversations;
import com.endo4life.domain.document.Resource;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.mapper.DoctorUserConversationMapper;
import com.endo4life.repository.DoctorUserConversationRepository;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.security.AuthoritiesConstants;
import com.endo4life.security.SecurityService;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.notification.NotificationService;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DoctorUserConversationServiceImpl implements DoctorUserConversationService {

    private final DoctorUserConversationRepository conversationRepository;
    private final ResourceRepository resourceRepository;
    private final UserInfoRepository userInfoRepository;
    private final DoctorUserConversationMapper mapper;
    private final MinioService minioService;
    private final ObjectMapper objectMapper;
    private final SecurityService securityService;
    private final NotificationService notificationService;

    @Override
    public DoctorUserConversationResponsePaginatedDto getConversations(
            DoctorUserConversationCriteria criteria,
            org.springframework.data.domain.Pageable pageable) {
        Specification<DoctorUserConversations> spec = buildSpecification(criteria);

        // Use Spring's Pageable directly or create default with sorting
        org.springframework.data.domain.Pageable finalPageable = pageable != null
                ? pageable
                : PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<DoctorUserConversations> page = conversationRepository.findAll(spec, finalPageable);

        DoctorUserConversationResponsePaginatedDto result = new DoctorUserConversationResponsePaginatedDto();
        result.setData(page.getContent().stream()
                .map(this::toResponseDtoWithReplies)
                .collect(Collectors.toList()));
        result.setTotal(page.getTotalElements());

        return result;
    }

    @Override
    public UUID createConversation(CreateDoctorUserConversationDto dto) {
        // Get authenticated user from JWT - this is the questioner
        UUID userId = UserContextHolder.getUserId()
                .map(UUID::fromString)
                .orElseThrow(() -> new BadRequestException("No authenticated user found"));

        UserInfo questioner = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("UserInfo not found with userId {0}", userId));

        // Create conversation entity
        DoctorUserConversations conversation = mapper.toEntity(dto);
        conversation.setQuestioner(questioner);

        // Set resource
        UUID resourceId = dto.getResourceId();
        if (Objects.nonNull(resourceId)) {
            Resource resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new BadRequestException("Resource not found with id {0}", resourceId));
            conversation.setResource(resource);
        }

        // Set assignee if provided
        UUID assigneeId = dto.getAssigneeId();
        if (Objects.nonNull(assigneeId)) {
            UserInfo assignee = userInfoRepository.findById(assigneeId)
                    .orElseThrow(() -> new BadRequestException("Assignee not found with id {0}", assigneeId));
            conversation.setAssignee(assignee);
        }

        // Set parent if this is a reply
        UUID parentId = dto.getParentId();
        if (Objects.nonNull(parentId)) {
            DoctorUserConversations parent = conversationRepository.findById(parentId)
                    .orElseThrow(() -> new BadRequestException("Parent conversation not found with id {0}", parentId));
            conversation.setParent(parent);
        }

        // Handle attachments (object keys from presigned URL uploads)
        if (dto.getAttachmentUrls() != null && !dto.getAttachmentUrls().isEmpty()) {
            try {
                conversation.setAttachmentUrls(objectMapper.writeValueAsString(dto.getAttachmentUrls()));
                conversation.setTypeAttachment("image");
            } catch (JsonProcessingException e) {
                log.error("Error converting attachment keys to JSON", e);
                throw new BadRequestException("Failed to process attachment URLs");
            }
        }

        // Set audit fields
        conversation.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        conversation.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        conversationRepository.save(conversation);

        // Send real-time notifications
        try {
            if (Objects.nonNull(parentId)) {
                // This is a reply - notify the parent conversation owner
                DoctorUserConversations parent = conversationRepository.findById(parentId).orElse(null);
                if (parent != null) {
                    // Notify questioner if replier is not the questioner
                    if (parent.getQuestioner() != null && !parent.getQuestioner().getId().equals(questioner.getId())) {
                        notificationService.notifyQuestionReplied(
                                parent.getQuestioner().getId(),
                                parentId,
                                dto.getContent()
                        );
                    }
                    // Notify assignee if replier is not the assignee
                    if (parent.getAssignee() != null && !parent.getAssignee().getId().equals(questioner.getId())) {
                        notificationService.notifyQuestionReplied(
                                parent.getAssignee().getId(),
                                parentId,
                                dto.getContent()
                        );
                    }
                }
            } else if (Objects.nonNull(assigneeId)) {
                // New question with assignee - notify the specialist
                notificationService.notifyNewQuestionAssigned(
                        assigneeId,
                        conversation.getId(),
                        dto.getContent()
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
            // Don't fail the operation if notification fails
        }

        return conversation.getId();
    }

    @Override
    public DoctorUserConversationResponseDto getConversationById(UUID id) {
        DoctorUserConversations conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Conversation not found with id {0}", id));
        return toResponseDtoWithReplies(conversation);
    }

    @Override
    public void updateConversation(UUID id, UpdateDoctorUserConversationDto dto) {
        DoctorUserConversations conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Conversation not found with id {0}", id));

        // Permission check: admin, coordinator, or assignee can update
        boolean isAdmin = securityService.hasRole(AuthoritiesConstants.ADMIN);
        boolean isCoordinator = securityService.hasRole(AuthoritiesConstants.COORDINATOR);
        boolean isAssignee = conversation.getAssignee() != null &&
                securityService.isOwner(conversation.getAssignee().getUserId());
        if (!isAdmin && !isCoordinator && !isAssignee) {
            throw new BadRequestException("You don't have permission to update this conversation");
        }

        // Track old values for notification
        UUID oldAssigneeId = conversation.getAssignee() != null ? conversation.getAssignee().getId() : null;
        String oldState = conversation.getState();

        mapper.updateEntityFromDto(conversation, dto);

        // Update assignee if provided
        UUID assigneeId = dto.getAssigneeId();
        boolean assigneeChanged = false;
        if (Objects.nonNull(assigneeId)) {
            UserInfo assignee = userInfoRepository.findById(assigneeId)
                    .orElseThrow(() -> new BadRequestException("Assignee not found with id {0}", assigneeId));
            conversation.setAssignee(assignee);
            assigneeChanged = !assigneeId.equals(oldAssigneeId);
        }

        // Update audit fields
        conversation.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        conversationRepository.save(conversation);

        // Send real-time notifications
        try {
            // Notify new assignee if changed
            if (assigneeChanged && Objects.nonNull(assigneeId)) {
                notificationService.notifyNewQuestionAssigned(
                        assigneeId,
                        id,
                        conversation.getContent()
                );
            }

            // Notify questioner if status changed to RESOLVED
            if (conversation.getQuestioner() != null &&
                    "RESOLVED".equals(conversation.getState()) &&
                    !"RESOLVED".equals(oldState)) {
                notificationService.notifyQuestionResolved(
                        conversation.getQuestioner().getId(),
                        id
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
            // Don't fail the operation if notification fails
        }
    }

    @Override
    public void deleteConversation(UUID id) {
        // Permission check: admin or coordinator can delete
        boolean isAdmin = securityService.hasRole(AuthoritiesConstants.ADMIN);
        boolean isCoordinator = securityService.hasRole(AuthoritiesConstants.COORDINATOR);
        if (!isAdmin && !isCoordinator) {
            throw new BadRequestException("Only administrators or coordinators can delete conversations");
        }
        if (!conversationRepository.existsById(id)) {
            throw new BadRequestException("Conversation not found with id {0}", id);
        }
        conversationRepository.deleteById(id);
    }

    /**
     * Build JPA Specification for filtering conversations
     */
    private Specification<DoctorUserConversations> buildSpecification(DoctorUserConversationCriteria criteria) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (criteria != null) {
                if (criteria.getResourceId() != null) {
                    predicates.add(cb.equal(root.get("resource").get("id"), criteria.getResourceId()));
                }
                if (criteria.getQuestionerId() != null) {
                    predicates.add(cb.equal(root.get("questioner").get("id"), criteria.getQuestionerId()));
                }
                if (criteria.getAssigneeId() != null) {
                    predicates.add(cb.equal(root.get("assignee").get("id"), criteria.getAssigneeId()));
                }
                if (criteria.getState() != null) {
                    predicates.add(cb.equal(root.get("state"), criteria.getState().toString()));
                }
            }

            // Only get top-level conversations (no parent)
            predicates.add(cb.isNull(root.get("parent")));

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private DoctorUserConversationResponseDto toResponseDtoWithReplies(DoctorUserConversations conversation) {
        DoctorUserConversationResponseDto dto = mapper.toResponseDto(conversation);

        // Set timestamps
        if (conversation.getCreatedAt() != null) {
            dto.setCreatedAt(conversation.getCreatedAt().atOffset(java.time.ZoneOffset.UTC));
        }
        if (conversation.getUpdatedAt() != null) {
            dto.setUpdatedAt(conversation.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC));
        }

        // Convert JSON attachment URLs to array
        if (conversation.getAttachmentUrls() != null) {
            try {
                List<String> objectKeys = objectMapper.readValue(
                        conversation.getAttachmentUrls(),
                        new TypeReference<List<String>>() {
                        });
                // Generate presigned URLs
                List<String> presignedUrls = objectKeys.stream()
                        .map(key -> minioService.createGetPreSignedLink(key, "images"))
                        .collect(Collectors.toList());
                dto.setAttachmentUrls(presignedUrls);
            } catch (JsonProcessingException e) {
                log.error("Error parsing attachment URLs", e);
                dto.setAttachmentUrls(new ArrayList<>());
            }
        } else {
            dto.setAttachmentUrls(new ArrayList<>());
        }

        // Load replies recursively
        List<DoctorUserConversations> replies = conversationRepository.findByParentId(conversation.getId());
        dto.setReplies(replies.stream()
                .map(this::toResponseDtoWithReplies)
                .collect(Collectors.toList()));

        return dto;
    }
}
