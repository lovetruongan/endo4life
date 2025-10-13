package com.endo4life.service.question;

import com.endo4life.domain.document.Question;
import com.endo4life.domain.document.QuestionAttachment;
import com.endo4life.domain.document.Test;
import com.endo4life.mapper.QuestionMapper;
import com.endo4life.repository.QuestionRepository;
import com.endo4life.repository.TestRepository;
import com.endo4life.utils.QuestionAttachmentUtil;
import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.QuestionAttachmentCreateDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final QuestionAttachmentUtil questionAttachmentUtil;
    private final ObjectMapper objectMapper; // Spring Boot tự động cung cấp bean này

    @Override
    public List<QuestionResponseDto> getQuestionsByTestId(UUID testId) {
        return questionRepository.findByTestIdOrderByOrderIndexAsc(testId).stream()
                .map(this::mapQuestionToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UUID createQuestion(UUID testId, CreateQuestionRequestDto createQuestionRequestDto) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + testId));

        Question question = questionMapper.toQuestion(createQuestionRequestDto);
        question.setTest(test);

        // Convert object answers to JSON string for DB storage
        try {
            if (createQuestionRequestDto.getAnswers() != null) {
                question.setAnswers(objectMapper.writeValueAsString(createQuestionRequestDto.getAnswers()));
            }
        } catch (JsonProcessingException e) {
            log.error("Error converting answers to JSON string", e);
        }

        // Handle attachments if provided
        if (createQuestionRequestDto.getAttachments() != null && !createQuestionRequestDto.getAttachments().isEmpty()) {
            List<QuestionAttachment> attachments = new ArrayList<>();
            for (QuestionAttachmentCreateDto attachmentDto : createQuestionRequestDto.getAttachments()) {
                QuestionAttachment attachment = QuestionAttachment.builder()
                        .question(question)
                        .objectKey(attachmentDto.getObjectKey())
                        .bucket(attachmentDto.getBucket())
                        .fileName(attachmentDto.getFileName())
                        .fileType(attachmentDto.getFileType())
                        .fileSize(attachmentDto.getFileSize())
                        .width(attachmentDto.getWidth())
                        .height(attachmentDto.getHeight())
                        .build();
                attachments.add(attachment);
            }
            question.setAttachments(attachments);
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

        // Update answers if provided
        try {
            if (updateQuestionRequestDto.getAnswers() != null) {
                question.setAnswers(objectMapper.writeValueAsString(updateQuestionRequestDto.getAnswers()));
            }
        } catch (JsonProcessingException e) {
            log.error("Error converting answers to JSON string for update", e);
        }

        // Update attachments if provided - replace existing attachments
        if (updateQuestionRequestDto.getAttachments() != null) {
            // Clear existing attachments
            question.getAttachments().clear();

            // Add new attachments
            if (!updateQuestionRequestDto.getAttachments().isEmpty()) {
                for (QuestionAttachmentCreateDto attachmentDto : updateQuestionRequestDto.getAttachments()) {
                    QuestionAttachment attachment = QuestionAttachment.builder()
                            .question(question)
                            .objectKey(attachmentDto.getObjectKey())
                            .bucket(attachmentDto.getBucket())
                            .fileName(attachmentDto.getFileName())
                            .fileType(attachmentDto.getFileType())
                            .fileSize(attachmentDto.getFileSize())
                            .width(attachmentDto.getWidth())
                            .height(attachmentDto.getHeight())
                            .build();
                    question.getAttachments().add(attachment);
                }
            }
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

        // Convert JSON string answers to object for client
        if (question.getAnswers() != null) {
            try {
                Object answersObject = objectMapper.readValue(question.getAnswers(), Object.class);
                dto.setAnswers(answersObject);
            } catch (JsonProcessingException e) {
                log.error("Error converting JSON string answers to object", e);
            }
        }

        // Convert attachments with presigned URLs
        dto.setAttachments(questionAttachmentUtil.convertIntoQuestionAttachmentsDto(question));

        return dto;
    }
}