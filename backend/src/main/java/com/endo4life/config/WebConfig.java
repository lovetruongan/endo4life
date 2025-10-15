package com.endo4life.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.endo4life.web.rest.api.UserV1ApiController;
import com.endo4life.web.rest.api.ResourceV1ApiController;
import com.endo4life.web.rest.api.CourseV1ApiController;
import com.endo4life.web.rest.api.MinioV1ApiController;
import com.endo4life.web.rest.api.UserV1ApiDelegate;
import com.endo4life.web.rest.api.ResourceV1ApiDelegate;
import com.endo4life.web.rest.api.CourseV1ApiDelegate;
import com.endo4life.web.rest.api.MinioV1ApiDelegate;
import com.endo4life.web.rest.api.TestV1ApiController;
import com.endo4life.web.rest.api.TestV1ApiDelegate;
import com.endo4life.web.rest.api.QuestionV1ApiController;
import com.endo4life.web.rest.api.QuestionV1ApiDelegate;
import com.endo4life.web.rest.api.DoctorUserConversationsV1ApiController;
import com.endo4life.web.rest.api.DoctorUserConversationsV1ApiDelegate;
import com.endo4life.web.rest.api.TagV1ApiController;
import com.endo4life.web.rest.api.TagV1ApiDelegate;
import com.endo4life.web.rest.api.CourseSectionV1ApiController;
import com.endo4life.web.rest.api.CourseSectionV1ApiDelegate;
import com.endo4life.web.rest.api.EnrollCourseV1ApiController;
import com.endo4life.web.rest.api.EnrollCourseV1ApiDelegate;
import com.endo4life.web.rest.api.UserCourseLecturesV1ApiController;
import com.endo4life.web.rest.api.UserCourseLecturesV1ApiDelegate;
import com.endo4life.web.rest.api.UserCourseV1ApiController;
import com.endo4life.web.rest.api.UserCourseV1ApiDelegate;
import com.endo4life.web.rest.api.UserResourceHistoryV1ApiController;
import com.endo4life.web.rest.api.UserResourceHistoryV1ApiDelegate;
import com.endo4life.web.rest.api.WebhookV1ApiController;
import com.endo4life.web.rest.api.WebhookV1ApiDelegate;
import com.endo4life.web.rest.api.CommentV1ApiController;
import com.endo4life.web.rest.api.CommentV1ApiDelegate;

@Configuration
public class WebConfig {

    @Bean
    public UserV1ApiController userV1ApiController(UserV1ApiDelegate delegate) {
        return new UserV1ApiController(delegate);
    }

    @Bean
    public ResourceV1ApiController resourceV1ApiController(ResourceV1ApiDelegate delegate) {
        return new ResourceV1ApiController(delegate);
    }

    @Bean
    public CourseV1ApiController courseV1ApiController(CourseV1ApiDelegate delegate) {
        return new CourseV1ApiController(delegate);
    }

    @Bean
    public MinioV1ApiController minioV1ApiController(MinioV1ApiDelegate delegate) {
        return new MinioV1ApiController(delegate);
    }

    @Bean
    public WebhookV1ApiController webhookV1ApiController(WebhookV1ApiDelegate delegate) {
        return new WebhookV1ApiController(delegate);
    }

    @Bean
    public TestV1ApiController testV1ApiController(TestV1ApiDelegate delegate) {
        return new TestV1ApiController(delegate);
    }

    @Bean
    public QuestionV1ApiController questionV1ApiController(QuestionV1ApiDelegate delegate) {
        return new QuestionV1ApiController(delegate);
    }

    @Bean
    public DoctorUserConversationsV1ApiController doctorUserConversationsV1ApiController(
            DoctorUserConversationsV1ApiDelegate delegate) {
        return new DoctorUserConversationsV1ApiController(delegate);
    }

    @Bean
    public TagV1ApiController tagV1ApiController(TagV1ApiDelegate delegate) {
        return new TagV1ApiController(delegate);
    }

    @Bean
    public CourseSectionV1ApiController courseSectionV1ApiController(CourseSectionV1ApiDelegate delegate) {
        return new CourseSectionV1ApiController(delegate);
    }

    @Bean
    public EnrollCourseV1ApiController enrollCourseV1ApiController(EnrollCourseV1ApiDelegate delegate) {
        return new EnrollCourseV1ApiController(delegate);
    }

    @Bean
    public UserCourseLecturesV1ApiController userCourseLecturesV1ApiController(
            UserCourseLecturesV1ApiDelegate delegate) {
        return new UserCourseLecturesV1ApiController(delegate);
    }

    @Bean
    public UserCourseV1ApiController userCourseV1ApiController(UserCourseV1ApiDelegate delegate) {
        return new UserCourseV1ApiController(delegate);
    }

    @Bean
    public UserResourceHistoryV1ApiController userResourceHistoryV1ApiController(
            UserResourceHistoryV1ApiDelegate delegate) {
        return new UserResourceHistoryV1ApiController(delegate);
    }

    @Bean
    public CommentV1ApiController commentV1ApiController(CommentV1ApiDelegate delegate) {
        return new CommentV1ApiController(delegate);
    }

}
