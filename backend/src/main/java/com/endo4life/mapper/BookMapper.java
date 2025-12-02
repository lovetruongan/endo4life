package com.endo4life.mapper;

import com.endo4life.domain.document.Book;
import com.endo4life.web.rest.model.BookResponseDto;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public interface BookMapper {
    BookResponseDto toBookResponseDto(Book book);
}
