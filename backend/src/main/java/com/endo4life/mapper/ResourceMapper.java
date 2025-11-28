package com.endo4life.mapper;

import com.endo4life.domain.document.Resource;
import com.endo4life.domain.document.Tag;
import com.endo4life.repository.TagRepository;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import com.endo4life.web.rest.model.UpdateResourceRequestDto;
import com.endo4life.web.rest.model.UserResourceDetailResponseDto;
import com.endo4life.web.rest.model.UserResourceResponseDto;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class ResourceMapper {

    @Autowired
    private MinioService minioService;

    @Autowired
    private TagRepository tagRepository;

    @Value("${spring.application.minio-configuration.endpoint}")
    private String minioEndpoint;
    @Value("${spring.application.minio-configuration.bucket-thumbnail}")
    private String bucketThumbnail;
    @Value("${spring.application.minio-configuration.bucket-image}")
    private String bucketImage;

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "resourceUrl", source = "resource", qualifiedByName = "resourcePathToUrl")
    @Mapping(target = "tags", source = "tag")
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "anatomyLocationTag", source = "anatomyLocationTag")
    @Mapping(target = "hpTag", source = "hpTag")
    @Mapping(target = "lightTag", source = "lightTag")
    @Mapping(target = "upperGastroAnatomyTag", source = "upperGastroAnatomyTag")
    public abstract ResourceDetailResponseDto toResourceDetailResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "tags", source = "tag")
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "anatomyLocationTag", source = "anatomyLocationTag")
    @Mapping(target = "hpTag", source = "hpTag")
    @Mapping(target = "lightTag", source = "lightTag")
    @Mapping(target = "upperGastroAnatomyTag", source = "upperGastroAnatomyTag")
    public abstract ResourceResponseDto toResourceResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "createdByInfo", ignore = true)
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "anatomyLocationTag", source = "anatomyLocationTag")
    @Mapping(target = "hpTag", source = "hpTag")
    @Mapping(target = "lightTag", source = "lightTag")
    @Mapping(target = "upperGastroAnatomyTag", source = "upperGastroAnatomyTag")
    @Mapping(target = "time", ignore = true)
    public abstract UserResourceResponseDto toUserResourceResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "resourceUrl", source = "resource", qualifiedByName = "resourcePathToUrl")
    @Mapping(target = "createdByInfo", ignore = true)
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "anatomyLocationTag", source = "anatomyLocationTag")
    @Mapping(target = "hpTag", source = "hpTag")
    @Mapping(target = "lightTag", source = "lightTag")
    @Mapping(target = "upperGastroAnatomyTag", source = "upperGastroAnatomyTag")
    @Mapping(target = "time", ignore = true)
    public abstract UserResourceDetailResponseDto toUserResourceDetailResponseDto(Resource resource);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            UpdateResourceRequestDto updateRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            CreateResourceRequestDto createRequest);

    // Convert tags from Resource entity to DTO (UUID → name for display)
    @org.mapstruct.AfterMapping
    protected void convertTagsToNames(@org.mapstruct.MappingTarget Object dto, Resource resource) {
        convertAllTagsToNames(dto, resource);
    }

    // Convert tags from request DTO to Resource entity (UUID → name for storage)
    @org.mapstruct.AfterMapping
    protected void convertTagsForStorage(@org.mapstruct.MappingTarget Resource resource, Object request) {
        if (request instanceof UpdateResourceRequestDto updateRequest) {
            updateAllTags(resource,
                    updateRequest.getTag(),
                    updateRequest.getDetailTag(),
                    updateRequest.getAnatomyLocationTag(),
                    updateRequest.getHpTag(),
                    updateRequest.getLightTag(),
                    updateRequest.getUpperGastroAnatomyTag());
        } else if (request instanceof CreateResourceRequestDto createRequest) {
            updateAllTags(resource,
                    createRequest.getTag(),
                    createRequest.getDetailTag(),
                    createRequest.getAnatomyLocationTag(),
                    createRequest.getHpTag(),
                    createRequest.getLightTag(),
                    createRequest.getUpperGastroAnatomyTag());
        }
    }

    // Helper: Convert all tag fields from Resource to DTO
    private void convertAllTagsToNames(Object dto, Resource resource) {
        List<String> tag = toNamesList(resource.getTag());
        List<String> detailTag = toNamesList(resource.getDetailTag());
        List<String> anatomyLocationTag = toNamesList(resource.getAnatomyLocationTag());
        List<String> hpTag = toNamesList(resource.getHpTag());
        List<String> lightTag = toNamesList(resource.getLightTag());
        List<String> upperGastroAnatomyTag = toNamesList(resource.getUpperGastroAnatomyTag());

        if (dto instanceof ResourceDetailResponseDto d) {
            d.setTags(tag);
            d.setTag(tag);
            d.setDetailTag(detailTag);
            d.setAnatomyLocationTag(anatomyLocationTag);
            d.setHpTag(hpTag);
            d.setLightTag(lightTag);
            d.setUpperGastroAnatomyTag(upperGastroAnatomyTag);
        } else if (dto instanceof ResourceResponseDto d) {
            d.setTags(tag);
            d.setTag(tag);
            d.setDetailTag(detailTag);
            d.setAnatomyLocationTag(anatomyLocationTag);
            d.setHpTag(hpTag);
            d.setLightTag(lightTag);
            d.setUpperGastroAnatomyTag(upperGastroAnatomyTag);
        } else if (dto instanceof UserResourceResponseDto d) {
            d.setTag(tag);
            d.setDetailTag(detailTag);
            d.setAnatomyLocationTag(anatomyLocationTag);
            d.setHpTag(hpTag);
            d.setLightTag(lightTag);
            d.setUpperGastroAnatomyTag(upperGastroAnatomyTag);
        } else if (dto instanceof UserResourceDetailResponseDto d) {
            d.setTag(tag);
            d.setDetailTag(detailTag);
            d.setAnatomyLocationTag(anatomyLocationTag);
            d.setHpTag(hpTag);
            d.setLightTag(lightTag);
            d.setUpperGastroAnatomyTag(upperGastroAnatomyTag);
        }
    }

    // Helper: Update all tag fields in Resource
    private void updateAllTags(Resource resource, List<String> tag, List<String> detailTag,
            List<String> anatomyLocationTag, List<String> hpTag,
            List<String> lightTag, List<String> upperGastroAnatomyTag) {
        if (Objects.nonNull(tag))
            resource.setTag(toNamesList(tag));
        if (Objects.nonNull(detailTag))
            resource.setDetailTag(toNamesList(detailTag));
        if (Objects.nonNull(anatomyLocationTag))
            resource.setAnatomyLocationTag(toNamesList(anatomyLocationTag));
        if (Objects.nonNull(hpTag))
            resource.setHpTag(toNamesList(hpTag));
        if (Objects.nonNull(lightTag))
            resource.setLightTag(toNamesList(lightTag));
        if (Objects.nonNull(upperGastroAnatomyTag))
            resource.setUpperGastroAnatomyTag(toNamesList(upperGastroAnatomyTag));
    }

    /**
     * Converts tag values to names. Handles both UUID and name inputs.
     * If UUID → looks up tag name. If already a name → returns as-is.
     */
    private List<String> toNamesList(List<String> values) {
        if (CollectionUtils.isEmpty(values)) {
            return new java.util.ArrayList<>();
        }
        return values.stream()
                .map(this::toTagName)
                .filter(StringUtils::isNotBlank)
                .toList();
    }

    private String toTagName(String value) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        try {
            UUID tagId = UUID.fromString(value);
            return tagRepository.findById(tagId)
                    .map(Tag::getContent)
                    .orElse(value);
        } catch (IllegalArgumentException e) {
            return value; // Already a name
        }
    }

    @Named("thumbnailToUrl")
    public String thumbnailToUrl(Resource resource) {
        if (Objects.isNull(resource)) {
            return null;
        }
        String thumbnail = resource.getThumbnail();
        if (StringUtils.isBlank(thumbnail)) {
            return null;
        }
        return minioService.createGetPreSignedLink(thumbnail, bucketThumbnail);
    }

    @Named("resourcePathToUrl")
    public String resourcePathToUrl(Resource resource) {
        if (Objects.isNull(resource.getPath())) {
            return null;
        }
        String resourceType = resource.getType().getValue();
        return minioService.getPreSignedLinkMethodGetWithResourceType(resource.getPath(), resourceType);
    }
}
