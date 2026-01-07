package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.doctoruserconversation.DoctorUserConversationService;
import com.endo4life.web.rest.api.DoctorUserConversationsV1ApiDelegate;
import com.endo4life.web.rest.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DoctorUserConversationsV1ApiDelegateImpl implements DoctorUserConversationsV1ApiDelegate {

    private final DoctorUserConversationService conversationService;

    @Override
    @RoleAccess.Authenticated // All authenticated users can list (filtered by their role in frontend)
    public ResponseEntity<DoctorUserConversationResponsePaginatedDto> getDoctorUserConversations(
            DoctorUserConversationCriteria criteria,
            Pageable pageable) {
        log.info("Getting doctor-user conversations with criteria: {}", criteria);
        DoctorUserConversationResponsePaginatedDto result = conversationService.getConversations(criteria, pageable);
        return ResponseEntity.ok(result);
    }

    @Override
    @RoleAccess.Authenticated // All authenticated users can create questions
    public ResponseEntity<IdWrapperDto> createConversationDoctorAndUser(
            CreateDoctorUserConversationDto createDoctorUserConversationDto) {
        log.info("Creating doctor-user conversation");
        UUID id = conversationService.createConversation(createDoctorUserConversationDto);
        IdWrapperDto response = new IdWrapperDto();
        response.setId(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @RoleAccess.Authenticated // All authenticated users can view their conversations
    public ResponseEntity<DoctorUserConversationResponseDto> getDoctorUserConversationById(UUID id) {
        log.info("Getting doctor-user conversation by id: {}", id);
        DoctorUserConversationResponseDto result = conversationService.getConversationById(id);
        return ResponseEntity.ok(result);
    }

    @Override
    @RoleAccess.Authenticated // Service layer checks permission (admin, coordinator, or assignee)
    public ResponseEntity<Void> updateDoctorUserConversation(
            UUID id,
            UpdateDoctorUserConversationDto updateDoctorUserConversationDto) {
        log.info("Updating doctor-user conversation: {}", id);
        conversationService.updateConversation(id, updateDoctorUserConversationDto);
        return ResponseEntity.noContent().build();
    }

    @Override
    @RoleAccess.UserManager // ADMIN or COORDINATOR can delete
    public ResponseEntity<Void> deleteDoctorUserConversation(UUID id) {
        log.info("Deleting doctor-user conversation: {}", id);
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
