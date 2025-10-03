package com.endo4life.mapper;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Resource;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import com.endo4life.web.rest.model.UpdateResourceRequestDto;
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

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "viewNumber", ignore = true)
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "detailTag", ignore = true)
    @Mapping(target = "anatomyLocationTag", ignore = true)
    @Mapping(target = "hpTag", ignore = true)
    @Mapping(target = "lightTag", ignore = true)
    @Mapping(target = "upperGastroAnatomyTag", ignore = true)
    @Mapping(target = "labelPolygon", ignore = true)
    @Mapping(target = "path", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "dimension", ignore = true)
    @Mapping(target = "size", ignore = true)
    @Mapping(target = "time", ignore = true)
    @Mapping(target = "extension", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "state", ignore = true)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            CreateResourceRequestDto createRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void toResource(@org.mapstruct.MappingTarget Resource resource,
            UpdateResourceRequestDto updateRequest);

    @Named("thumbnailToUrl")
    public String thumbnailToUrl(Resource resource) {
        if (Objects.isNull(resource)) {
            return null;
        }
        String thumbnail = resource.getThumbnail();
        if (StringUtils.isBlank(thumbnail)) {
            return null;
        }
        if (StringUtils.equalsIgnoreCase(resource.getType().getValue(), Constants.IMAGE_RESOURCE_TYPE)) {
            return minioService.createGetPreSignedLink(thumbnail, bucketImage);
        } else {
            return minioService.createGetPreSignedLink(thumbnail, bucketThumbnail);
        }
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
