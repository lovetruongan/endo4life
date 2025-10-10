package com.endo4life.domain.document;

import com.endo4life.web.rest.model.TagType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tag")
@Entity
public class Tag extends AbstractEntity {

    private UUID parentId;

    private String content;

    @Enumerated(EnumType.STRING)
    private TagType type;
}
