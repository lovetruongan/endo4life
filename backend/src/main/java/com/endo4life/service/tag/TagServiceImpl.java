package com.endo4life.service.tag;

import com.endo4life.domain.document.Tag;
import com.endo4life.mapper.TagMapper;
import com.endo4life.repository.TagRepository;
import com.endo4life.repository.specifications.TagSpecifications;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.CreateTagRequestDto;
import com.endo4life.web.rest.model.TagResponseDto;
import com.endo4life.web.rest.model.TagType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    @Override
    public List<TagResponseDto> getTags(List<UUID> ids, TagType type) {
        return tagRepository
                .findAll(TagSpecifications.byCriteria(ids, type))
                .stream()
                .map(tagMapper::toTagResponseDto).toList();
    }

    @Override
    public void createTag(CreateTagRequestDto createTagRequestDto) {
        List<String> tags = createTagRequestDto.getTag();
        if (CollectionUtils.isEmpty(tags)) {
            throw new BadRequestException("Must have at least one parent tag !");
        }
        List<String> detailTags = createTagRequestDto.getDetailTag();
        if (tags.size() > 1 && CollectionUtils.isNotEmpty(detailTags)) {
            throw new BadRequestException("Only one parent tag allowed !");
        }

        TagType type = createTagRequestDto.getType();
        if (tags.size() > 1 || CollectionUtils.isEmpty(detailTags)) {
            tagRepository.saveAll(tags.stream()
                    .map(tag -> Tag.builder().content(tag).type(type).build())
                    .toList());
        } else {
            UUID parentId = tagRepository.findByContent(tags.get(0))
                    .orElseGet(() -> tagRepository.save(Tag.builder().content(tags.get(0)).type(type).build()))
                    .getId();
            tagRepository.saveAll(
                    detailTags.stream()
                            .map(tag -> Tag.builder().content(tag).parentId(parentId).type(type).build())
                            .toList());
        }
    }

    @Override
    public void deleteTag(List<UUID> tagIds, List<UUID> tagDetailIds) {
        if (CollectionUtils.isNotEmpty(tagIds)) {
            tagIds.addAll(tagRepository.findAllIdsByParentIdIn(tagIds));
            log.info("Delete tags {}", tagIds);
            tagRepository.deleteAllById(tagIds);
        }
        if (CollectionUtils.isNotEmpty(tagDetailIds)) {
            tagRepository.deleteAllById(tagDetailIds);
        }
    }

    @Override
    public boolean isDetailTag(String name) {
        Tag result = tagRepository.findByContent(name)
                .orElse(null);
        if (Objects.isNull(result)) {
            return true;
        }
        return Objects.nonNull(result.getParentId());
    }
}
