package com.endo4life.mapper;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.web.rest.model.StatusUserProgressCourseDto;
import com.endo4life.web.rest.model.UserProgressCourseDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Objects;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public abstract class UserRegistrationCourseMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "numberLecturesCompleted", source = "userRegistrationCourse.numberLecturesCompleted", qualifiedByName = "setNumberLecturesCompleted")
    public abstract UserProgressCourseDto toUserProgressCourseDto(UserRegistrationCourse userRegistrationCourse);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract StatusUserProgressCourseDto toStatusUserProgressCourseDto(
            UserRegistrationCourse userRegistrationCourse);

    @Named("setNumberLecturesCompleted")
    public Integer setNumberLecturesCompleted(Integer numberLecturesCompleted) {
        if (Objects.isNull(numberLecturesCompleted)) {
            return Constants.ZERO_INTEGER;
        }
        return numberLecturesCompleted;
    }
}
