package com.endo4life.utils.minio;

import com.endo4life.web.rest.model.ResourceType;
import lombok.experimental.UtilityClass;

import java.util.EnumMap;

@UtilityClass
public class MinIOUtil {

    private final static EnumMap<ResourceType, String> bucketResourceTypeMap = new EnumMap<>(ResourceType.class);

    public void setBucketResourceMap(ResourceType key, String value) {
        bucketResourceTypeMap.computeIfAbsent(key, k -> value);
    }

    public String belongToBucket(ResourceType type) {
        return switch (type) {
            case VIDEO -> bucketResourceTypeMap.get(ResourceType.VIDEO);
            case IMAGE -> bucketResourceTypeMap.get(ResourceType.IMAGE);
            case AVATAR -> bucketResourceTypeMap.get(ResourceType.AVATAR);
            case THUMBNAIL -> bucketResourceTypeMap.get(ResourceType.THUMBNAIL);
            case OTHER -> bucketResourceTypeMap.get(ResourceType.OTHER);
            case PROCESS -> bucketResourceTypeMap.get(ResourceType.PROCESS);
            default -> throw new IllegalArgumentException("Invalid resource type: " + type);
        };
    }
}
