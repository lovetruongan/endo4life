package com.endo4life.service.question;

import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface QuestionService {
    List<QuestionResponseDto> getQuestionsByTestId(UUID testId);
    UUID createQuestion(UUID testId, CreateQuestionRequestDto createQuestionRequestDto);
    QuestionResponseDto getQuestionById(UUID id);
    void updateQuestion(UUID id, UpdateQuestionRequestDto updateQuestionRequestDto);
    void deleteQuestion(UUID id);
    // Tạm thời để trống phần attachment, sẽ implement trong QuestionAttachmentService nếu cần
    // void addAttachmentToQuestion(UUID questionId, MultipartFile file);
    // void removeAttachmentFromQuestion(UUID attachmentId);
}