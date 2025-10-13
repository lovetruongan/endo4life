package com.endo4life.service.question;

import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import java.util.List;
import java.util.UUID;

public interface QuestionService {
    List<QuestionResponseDto> getQuestionsByTestId(UUID testId);

    UUID createQuestion(UUID testId, CreateQuestionRequestDto createQuestionRequestDto);

    QuestionResponseDto getQuestionById(UUID id);

    void updateQuestion(UUID id, UpdateQuestionRequestDto updateQuestionRequestDto);

    void deleteQuestion(UUID id);
}