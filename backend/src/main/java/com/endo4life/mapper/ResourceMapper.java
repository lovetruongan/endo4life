package com.endo4life.mapper;

import com.endo4life.domain.document.Resource;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import com.endo4life.web.rest.model.UpdateResourceRequestDto;
import com.endo4life.web.rest.model.UserResourceDetailResponseDto;
import com.endo4life.web.rest.model.UserResourceResponseDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Objects;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class ResourceMapper {

    @Autowired
    private MinioService minioService;

    @Value("${spring.application.minio-configuration.endpoint}")
    private String minioEndpoint;
    @Value("${spring.application.minio-configuration.bucket-thumbnail}")
    private String bucketThumbnail;
    @Value("${spring.application.minio-configuration.bucket-image}")
    private String bucketImage;

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "resourceUrl", source = "resource", qualifiedByName = "resourcePathToUrl")
    @Mapping(target = "tags", ignore = true)
    public abstract ResourceDetailResponseDto toResourceDetailResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "tags", ignore = true)
    public abstract ResourceResponseDto toResourceResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "resource", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "createdByInfo", ignore = true)
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "time", ignore = true)
    public abstract UserResourceResponseDto toUserResourceResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "resourceUrl", source = "resource", qualifiedByName = "resourcePathToUrl")
    @Mapping(target = "createdByInfo", ignore = true)
    @Mapping(target = "tag", source = "tag")
    @Mapping(target = "detailTag", source = "detailTag")
    @Mapping(target = "time", ignore = true)
    public abstract UserResourceDetailResponseDto toUserResourceDetailResponseDto(Resource resource);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            UpdateResourceRequestDto updateRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            CreateResourceRequestDto createRequest);

    @org.mapstruct.AfterMapping
    protected void updateTags(@org.mapstruct.MappingTarget Resource resource, UpdateResourceRequestDto updateRequest) {
        if (Objects.nonNull(updateRequest.getDetailTag())) {
            resource.setDetailTag(new java.util.ArrayList<>(updateRequest.getDetailTag()));
        }
        if (Objects.nonNull(updateRequest.getTag())) {
            resource.setTag(new java.util.ArrayList<>(updateRequest.getTag()));
        }
        if (Objects.nonNull(updateRequest.getAnatomyLocationTag())) {
            resource.setAnatomyLocationTag(updateRequest.getAnatomyLocationTag());
        }
        if (Objects.nonNull(updateRequest.getHpTag())) {
            resource.setHpTag(new java.util.ArrayList<>(updateRequest.getHpTag()));
        }
        if (Objects.nonNull(updateRequest.getLightTag())) {
            resource.setLightTag(new java.util.ArrayList<>(updateRequest.getLightTag()));
        }
        if (Objects.nonNull(updateRequest.getUpperGastroAnatomyTag())) {
            resource.setUpperGastroAnatomyTag(new java.util.ArrayList<>(updateRequest.getUpperGastroAnatomyTag()));
        }
    }

    @org.mapstruct.AfterMapping
    protected void createTags(@org.mapstruct.MappingTarget Resource resource, CreateResourceRequestDto createRequest) {
        if (Objects.nonNull(createRequest.getDetailTag())) {
            resource.setDetailTag(new java.util.ArrayList<>(createRequest.getDetailTag()));
        }
        if (Objects.nonNull(createRequest.getTag())) {
            resource.setTag(new java.util.ArrayList<>(createRequest.getTag()));
        }
        if (Objects.nonNull(createRequest.getAnatomyLocationTag())) {
            resource.setAnatomyLocationTag(createRequest.getAnatomyLocationTag());
        }
        if (Objects.nonNull(createRequest.getHpTag())) {
            resource.setHpTag(new java.util.ArrayList<>(createRequest.getHpTag()));
        }
        if (Objects.nonNull(createRequest.getLightTag())) {
            resource.setLightTag(new java.util.ArrayList<>(createRequest.getLightTag()));
        }
        if (Objects.nonNull(createRequest.getUpperGastroAnatomyTag())) {
            resource.setUpperGastroAnatomyTag(new java.util.ArrayList<>(createRequest.getUpperGastroAnatomyTag()));
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
