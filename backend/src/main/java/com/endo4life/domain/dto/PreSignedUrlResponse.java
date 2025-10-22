package com.endo4life.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreSignedUrlResponse {
    private String url;
    private String objectKey;
}