package com.endo4life.domain.document;

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
    @Column(name = "type", length = 20)
    private ResourceType type;

    @Column(name = "path")
    private String path;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private ResourceState state;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "dimension")
    private String dimension;

    @Column(name = "size")
    private String size;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Type(JsonBinaryType.class)
    @Column(name = "label_polygon", columnDefinition = "jsonb")
    private String labelPolygon;

    @Column(name = "view_number")
    private Integer viewNumber = 0;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tag", columnDefinition = "TEXT")
    private String tag;

    @Column(name = "detail_tag", columnDefinition = "TEXT")
    private String detailTag;

    @Column(name = "anatomy_location_tag", columnDefinition = "TEXT")
    private String anatomyLocationTag;

    @Column(name = "hp_tag", columnDefinition = "TEXT")
    private String hpTag;

    @Column(name = "light_tag", columnDefinition = "TEXT")
    private String lightTag;

    @Column(name = "upper_gastro_anatomy_tag", columnDefinition = "TEXT")
    private String upperGastroAnatomyTag;

    @Column(name = "time")
    private Integer time;

    @Column(name = "extension")
    private String extension;

    @Column(name = "comment_count", nullable = false)
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
        return new ArrayList<>(Arrays.asList(this.detailTag.split(",")));
    }

    public void setDetailTag(List<String> detailTags) {
        if (CollectionUtils.isNotEmpty(detailTags)) {
            this.detailTag = String.join(",", detailTags);
        } else {
            this.detailTag = null;
        }
    }

    public List<String> getTag() {
        if (StringUtils.isBlank(this.tag)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(this.tag.split(",")));
    }

    public void setTag(List<String> tags) {
        if (CollectionUtils.isNotEmpty(tags)) {
            this.tag = String.join(",", tags);
        } else {
            this.tag = null;
        }
    }

    // Enums
    public enum ResourceType {
        IMAGE("IMAGE"),
        VIDEO("VIDEO"),
        AVATAR("AVATAR"),
        THUMBNAIL("THUMBNAIL"),
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
