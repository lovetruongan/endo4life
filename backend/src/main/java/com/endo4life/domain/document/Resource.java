package com.endo4life.domain.document;

import com.endo4life.constant.Constants;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "resource")
@Slf4j
public class Resource extends AbstractEntity {

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    private String path;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceState state;

    @Column(nullable = false)
    private String thumbnail;

    private String dimension;

    private String size;

    @Column(nullable = false)
    private String title;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private String labelPolygon;

    private Integer viewNumber = 0;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String tag;

    @Column(columnDefinition = "text")
    private String detailTag;

    @Column(columnDefinition = "text")
    private String anatomyLocationTag;

    @Column(columnDefinition = "text")
    private String hpTag;

    @Column(columnDefinition = "text")
    private String lightTag;

    @Column(columnDefinition = "text")
    private String upperGastroAnatomyTag;

    private Integer time;

    private String extension;

    // Book-specific fields
    private String author;

    private String publisher;

    private Integer publishYear;

    @Column(length = 50)
    private String isbn;

    @Column(nullable = false)
    private Integer commentCount = 0;

    public void incrementCommentCount() {
        this.commentCount++;
    }

    public void decrementCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }

    public List<String> getDetailTag() {
        if (StringUtils.isBlank(this.detailTag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.detailTag.split(Constants.COMMA)));
    }

    public void setDetailTag(List<String> detailTags) {
        if (CollectionUtils.isNotEmpty(detailTags)) {
            this.detailTag = String.join(Constants.COMMA, detailTags);
        } else {
            this.detailTag = null;
        }
    }

    public List<String> getTag() {
        if (StringUtils.isBlank(this.tag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.tag.split(Constants.COMMA)));
    }

    public void setTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.tag = String.join(Constants.COMMA, tags);
        } else {
            this.tag = null;
        }
    }

    public List<String> getAnatomyLocationTag() {
        if (StringUtils.isBlank(this.anatomyLocationTag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.anatomyLocationTag.split(Constants.COMMA)));
    }

    public void setAnatomyLocationTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.anatomyLocationTag = String.join(Constants.COMMA, tags);
        } else {
            this.anatomyLocationTag = null;
        }
    }

    public List<String> getLightTag() {
        if (StringUtils.isBlank(this.lightTag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.lightTag.split(Constants.COMMA)));
    }

    public void setLightTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.lightTag = String.join(Constants.COMMA, tags);
        } else {
            this.lightTag = null;
        }
    }

    public List<String> getHpTag() {
        if (StringUtils.isBlank(this.hpTag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.hpTag.split(Constants.COMMA)));
    }

    public void setHpTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.hpTag = String.join(Constants.COMMA, tags);
        } else {
            this.hpTag = null;
        }
    }

    public List<String> getUpperGastroAnatomyTag() {
        if (StringUtils.isBlank(this.upperGastroAnatomyTag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.upperGastroAnatomyTag.split(Constants.COMMA)));
    }

    public void setUpperGastroAnatomyTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.upperGastroAnatomyTag = String.join(Constants.COMMA, tags);
        } else {
            this.upperGastroAnatomyTag = null;
        }
    }

    // Enums
    public enum ResourceType {
        IMAGE("IMAGE"),
        VIDEO("VIDEO"),
        AVATAR("AVATAR"),
        THUMBNAIL("THUMBNAIL"),
        BOOK("BOOK"),
        OTHER("OTHER"),
        PROCESS("PROCESS");

        private final String value;

        ResourceType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum ResourceState {
        DRAFT("DRAFT"),
        PUBLIC("PUBLIC"),
        PRIVATE("PRIVATE"),
        UNLISTED("UNLISTED");

        private final String value;

        ResourceState(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
