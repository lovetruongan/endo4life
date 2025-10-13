package com.endo4life.service.doctoruserconversation;

import com.endo4life.web.rest.model.CreateDoctorUserConversationDto;
import com.endo4life.web.rest.model.DoctorUserConversationCriteria;
import com.endo4life.web.rest.model.DoctorUserConversationResponseDto;
import com.endo4life.web.rest.model.DoctorUserConversationResponsePaginatedDto;
import com.endo4life.web.rest.model.UpdateDoctorUserConversationDto;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DoctorUserConversationService {

    DoctorUserConversationResponsePaginatedDto getConversations(
            DoctorUserConversationCriteria criteria,
            Pageable pageable);

    UUID createConversation(CreateDoctorUserConversationDto dto);

    DoctorUserConversationResponseDto getConversationById(UUID id);

    void updateConversation(UUID id, UpdateDoctorUserConversationDto dto);

    void deleteConversation(UUID id);
}
