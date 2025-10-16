package com.endo4life.domain.enumeration;

public enum MinIOEventAction {
    PUT("Put"),
    COMPLETE_MULTIPART_UPLOAD("CompleteMultipartUpload"),
    GET("Get"),
    DELETE("Delete"),
    REPLICA("Replica"),
    ILM("ILM"),
    SCANNER("Scanner"),
    COPY("Copy"),
    HEAD("Head");

    private final String value;

    MinIOEventAction(final String value) {
        this.value = value;
    }

    public static MinIOEventAction fromValue(String value) {
        for (MinIOEventAction b : MinIOEventAction.values()) {
            if (b.value.equals(value)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
}
