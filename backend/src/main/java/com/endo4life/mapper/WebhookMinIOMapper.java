package com.endo4life.mapper;

import com.endo4life.web.rest.model.WebhookMinIOEventDto;
import jakarta.ws.rs.BadRequestException;
import com.endo4life.constant.Constants;
import com.endo4life.domain.dto.DetailMinIOEventDto;
import com.endo4life.domain.enumeration.MinIOEventAction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Objects;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public abstract class WebhookMinIOMapper {
    @Mapping(target = "action", source = "event.eventName", qualifiedByName = "extractAction")
    @Mapping(target = "bucket", source = "event.key", qualifiedByName = "extractBucket")
    @Mapping(target = "objectKey", source = "event.key", qualifiedByName = "extractKey")
    @Mapping(target = "event", source = "event")
    public abstract DetailMinIOEventDto toEventDetail(WebhookMinIOEventDto event);

    @Named("extractAction")
    public MinIOEventAction extractAction(String eventName) {
        if (Objects.isNull(eventName)) {
            throw new BadRequestException("eventName cannot be null");
        }
        return MinIOEventAction.fromValue(eventName.split(Constants.COLON)[2]);
    }

    @Named("extractBucket")
    public String extractBucket(String key) {
        if (Objects.isNull(key)) {
            throw new BadRequestException("key cannot be null");
        }
        return key.split(Constants.SLASH)[0];
    }

    @Named("extractKey")
    public String extractKey(String key) {
        if (Objects.isNull(key)) {
            throw new BadRequestException("key cannot be null");
        }
        return key.split(Constants.SLASH)[1];
    }
}
