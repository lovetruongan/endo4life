package com.endo4life.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Optional;

import org.mapstruct.Mapper;
import static org.mapstruct.MappingConstants.ComponentModel.SPRING;
import org.mapstruct.Named;

import jakarta.annotation.Nullable;

@Mapper(componentModel = SPRING)
public abstract class DateTimeMapper {

    @Named("toLocalDate")
    public LocalDate toLocalDate(final @Nullable OffsetDateTime offsetDateTime) {
        return Optional.ofNullable(offsetDateTime)
                .map(OffsetDateTime::toLocalDate)
                .orElse(null);
    }

    @Named("toLocalDateTime")
    public LocalDateTime toLocalDateTime(final @Nullable OffsetDateTime offsetDateTime) {
        return Optional.ofNullable(offsetDateTime)
                .map(OffsetDateTime::toLocalDateTime)
                .orElse(null);
    }

    @Named("toOffsetDateTime")
    public OffsetDateTime toOffsetDateTime(final @Nullable LocalDateTime localDateTime) {
        return Optional.ofNullable(localDateTime)
                .map(time -> time.atZone(ZoneOffset.systemDefault()))
                .map(ZonedDateTime::toOffsetDateTime)
                .orElse(null);
    }
}
