package com.endo4life.mapper;

import com.endo4life.domain.document.Test;
import com.endo4life.utils.QuestionAttachmentUtil;
import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
@Slf4j
public abstract class TestMapper {

    @Autowired
    protected QuestionMapper questionMapper;

    @Autowired
    protected QuestionAttachmentUtil questionAttachmentUtil;

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(target = "course", ignore = true) // Sẽ được set trong service
    @Mapping(target = "questions", ignore = true)
    public abstract Test toTest(CreateTestRequestDto createTestRequestDto);

    @Mapping(source = "course.id", target = "courseId")
    public abstract TestResponseDto toTestResponseDto(Test test);

    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "test", target = "questions", qualifiedByName = "mapQuestionsWithAttachments")
    public abstract TestDetailResponseDto toTestDetailResponseDto(Test test);

    @Named("mapQuestionsWithAttachments")
    public List<QuestionResponseDto> mapQuestionsWithAttachments(Test test) {
        if (test.getQuestions() == null || test.getQuestions().isEmpty()) {
            return new ArrayList<>();
        }

        return test.getQuestions().stream()
                .map(question -> {
                    QuestionResponseDto dto = questionMapper.toQuestionResponseDto(question);

                    // Convert JSON string answers to object
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
                })
                .collect(Collectors.toList());
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "questions", ignore = true)
    public abstract void updateTestFromDto(@MappingTarget Test test, UpdateTestRequestDto updateTestRequestDto);
}