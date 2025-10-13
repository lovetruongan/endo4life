package com.endo4life.mapper;

import com.endo4life.domain.document.Question;
import com.endo4life.utils.QuestionAttachmentUtil;
import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.QuestionResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class QuestionMapper {

    @Autowired
    protected QuestionAttachmentUtil questionAttachmentUtil;

    @Mapping(target = "test", ignore = true) // Sẽ được set trong service
    @Mapping(target = "answers", ignore = true) // Chuyển đổi JSON thủ công nếu cần
    @Mapping(target = "attachments", ignore = true)
    public abstract Question toQuestion(CreateQuestionRequestDto createQuestionRequestDto);

    @Mapping(target = "answers", ignore = true) // Chuyển đổi JSON thủ công nếu cần
    @Mapping(target = "attachments", ignore = true)
    public abstract QuestionResponseDto toQuestionResponseDto(Question question);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "test", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "answers", ignore = true) // Chuyển đổi JSON thủ công nếu cần
    public abstract void updateQuestionFromDto(@MappingTarget Question question,
            UpdateQuestionRequestDto updateQuestionRequestDto);
}