package com.endo4life.service.tag;

import com.endo4life.web.rest.model.CreateTagRequestDto;
import com.endo4life.web.rest.model.TagResponseDto;
import com.endo4life.web.rest.model.TagType;

import java.util.List;
import java.util.UUID;

public interface TagService {

    List<TagResponseDto> getTags(List<UUID> ids, TagType type);

    void createTag(CreateTagRequestDto createTagRequestDto);

    void deleteTag(List<UUID> tagIds, List<UUID> tagDetailIds);

    boolean isDetailTag(String name);
}
