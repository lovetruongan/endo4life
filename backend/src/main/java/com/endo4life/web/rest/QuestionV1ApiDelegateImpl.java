package com.endo4life.web.rest;

import com.endo4life.service.question.QuestionService;
import com.endo4life.web.rest.api.QuestionV1ApiDelegate;
import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class QuestionV1ApiDelegateImpl implements QuestionV1ApiDelegate {

    private final QuestionService questionService;

    @Override
    public ResponseEntity<IdWrapperDto> createQuestion(UUID testId, CreateQuestionRequestDto createQuestionRequestDto) {
        UUID id = questionService.createQuestion(testId, createQuestionRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<Void> deleteQuestion(UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<QuestionResponseDto> getQuestionById(UUID id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @Override
    public ResponseEntity<List<QuestionResponseDto>> getQuestionsByTestId(UUID testId) {
        return ResponseEntity.ok(questionService.getQuestionsByTestId(testId));
    }

    @Override
    public ResponseEntity<Void> updateQuestion(UUID id, UpdateQuestionRequestDto updateQuestionRequestDto) {
        questionService.updateQuestion(id, updateQuestionRequestDto);
        return ResponseEntity.noContent().build();
    }
}