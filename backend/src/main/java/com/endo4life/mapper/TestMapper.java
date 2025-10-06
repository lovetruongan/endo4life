package com.endo4life.mapper;

import com.endo4life.domain.document.Test;
import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class, QuestionMapper.class })
public abstract class TestMapper {

    @Mapping(target = "course", ignore = true) // Sẽ được set trong service
    public abstract Test toTest(CreateTestRequestDto createTestRequestDto);

    @Mapping(source = "course.id", target = "courseId")
    public abstract TestResponseDto toTestResponseDto(Test test);

    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "questions", target = "questions")
    public abstract TestDetailResponseDto toTestDetailResponseDto(Test test);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "questions", ignore = true)
    public abstract void updateTestFromDto(@MappingTarget Test test, UpdateTestRequestDto updateTestRequestDto);
}