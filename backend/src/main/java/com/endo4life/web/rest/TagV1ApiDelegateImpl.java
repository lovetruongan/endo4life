package com.endo4life.web.rest;

import com.endo4life.service.tag.TagService;
import com.endo4life.web.rest.model.CreateTagRequestDto;
import com.endo4life.web.rest.model.TagResponseDto;
import com.endo4life.web.rest.model.TagType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TagV1ApiDelegateImpl implements com.endo4life.web.rest.api.TagV1ApiDelegate {

    private final TagService tagService;

    @Override
    public ResponseEntity<List<TagResponseDto>> getTags(List<UUID> parentTag, TagType type) {
        return ResponseEntity.ok(tagService.getTags(parentTag, type));
    }

    @Override
    public ResponseEntity<Void> createTag(CreateTagRequestDto createTagRequestDto) {
        tagService.createTag(createTagRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Override
    public ResponseEntity<Void> deleteTag(List<UUID> tagIds, List<UUID> tagDetailIds) {
        tagService.deleteTag(tagIds, tagDetailIds);
        return ResponseEntity.noContent().build();
    }
}
