package com.endo4life.domain.document;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "doctor_user_conversations")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorUserConversations extends AbstractEntity {
    private String type;

    private String state;

    private String content;

    private String attachmentUrls;

    private String typeAttachment;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private DoctorUserConversations parent;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne
    @JoinColumn(name = "questioner_id", nullable = false)
    private UserInfo questioner;

    @ManyToOne
    @JoinColumn(name = "assignee_id", nullable = false)
    private UserInfo assignee;
}
