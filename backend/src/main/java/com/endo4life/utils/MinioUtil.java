package com.endo4life.utils;

import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.stream.Collectors;

@UtilityClass
public class MinioUtil {
    public String generatePolicyPublic(String bucket, String... actions) {
        return "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\n" +
                Arrays.stream(actions)
                        .map(action -> "        \"" + action + "\"")
                        .collect(Collectors.joining(",\n"))
                + "\n" +
                "      ],\n" +
                "      \"Resource\": \"arn:aws:s3:::" + bucket + "/*\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    public String generatePolicyPrivate(String bucket, String... actions) {
        return "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Deny\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\n" +
                Arrays.stream(actions)
                        .map(action -> "        \"" + action + "\"")
                        .collect(Collectors.joining(",\n"))
                + "\n" +
                "      ],\n" +
                "      \"Resource\": \"arn:aws:s3:::" + bucket + "/*\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }
}
