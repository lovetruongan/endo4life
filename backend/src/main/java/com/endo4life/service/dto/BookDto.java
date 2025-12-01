package com.endo4life.service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class BookDto {
    private UUID id;
    private String title;
    private String author;
    private String description;
    private String fileUrl;
    private String coverUrl;
}
