package com.endo4life.domain.document;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "doctor_user_conversations")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorUserConversations extends AbstractEntity {

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "attachment_urls", columnDefinition = "text")
    private String attachmentUrls;

    /**
     * Type of attachments: typically "image"
     */
    @Column(name = "type_attachment")
    private String typeAttachment;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private DoctorUserConversations parent;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    /**
     * User who asked the question (typically a patient/student)
     * Automatically set from JWT token, not from request
     */
    @ManyToOne
    @JoinColumn(name = "questioner_id", nullable = false)
    private UserInfo questioner;

    /**
     * Doctor assigned to answer the question
     * Optional - can be assigned later by admin
     */
    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private UserInfo assignee;
}
