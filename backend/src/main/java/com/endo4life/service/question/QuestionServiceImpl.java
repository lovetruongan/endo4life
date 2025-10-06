package com.endo4life.service.question;

import com.endo4life.domain.document.Question;
import com.endo4life.domain.document.Test;
import com.endo4life.mapper.QuestionMapper;
import com.endo4life.repository.QuestionRepository;
import com.endo4life.repository.TestRepository;
import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;
    private final QuestionMapper questionMapper;
    private final ObjectMapper objectMapper; // Spring Boot tự động cung cấp bean này

    @Override
    public List<QuestionResponseDto> getQuestionsByTestId(UUID testId) {
        // Cần thêm phương thức findByTestId trong QuestionRepository
        // return questionRepository.findByTestIdOrderByOrderIndexAsc(testId).stream()
        //         .map(this::mapQuestionToDto)
        //         .collect(Collectors.toList());
        // Tạm thời trả về list rỗng
        return List.of();
    }

    @Override
    public UUID createQuestion(UUID testId, CreateQuestionRequestDto createQuestionRequestDto) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + testId));

        Question question = questionMapper.toQuestion(createQuestionRequestDto);
        question.setTest(test);

        // Chuyển đổi object answers thành chuỗi JSON để lưu vào DB
        try {
            if (createQuestionRequestDto.getAnswers() != null) {
                question.setAnswers(objectMapper.writeValueAsString(createQuestionRequestDto.getAnswers()));
            }
        } catch (JsonProcessingException e) {
            log.error("Error converting answers to JSON string", e);
            // Có thể throw một exception ở đây
        }

        questionRepository.save(question);
        return question.getId();
    }

    @Override
    public QuestionResponseDto getQuestionById(UUID id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question not found with id: " + id));
        return mapQuestionToDto(question);
    }

    @Override
    public void updateQuestion(UUID id, UpdateQuestionRequestDto updateQuestionRequestDto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question not found with id: " + id));

        questionMapper.updateQuestionFromDto(question, updateQuestionRequestDto);

        // Cập nhật answers nếu có
        try {
            if (updateQuestionRequestDto.getAnswers() != null) {
                question.setAnswers(objectMapper.writeValueAsString(updateQuestionRequestDto.getAnswers()));
            }
        } catch (JsonProcessingException e) {
            log.error("Error converting answers to JSON string for update", e);
        }

        questionRepository.save(question);
    }

    @Override
    public void deleteQuestion(UUID id) {
        if (!questionRepository.existsById(id)) {
            throw new NotFoundException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    private QuestionResponseDto mapQuestionToDto(Question question) {
        QuestionResponseDto dto = questionMapper.toQuestionResponseDto(question);
        // Chuyển chuỗi JSON answers thành object để trả về cho client
        if (question.getAnswers() != null) {
            try {
                Object answersObject = objectMapper.readValue(question.getAnswers(), Object.class);
                dto.setAnswers(answersObject);
            } catch (JsonProcessingException e) {
                log.error("Error converting JSON string answers to object", e);
            }
        }
        return dto;
    }
}