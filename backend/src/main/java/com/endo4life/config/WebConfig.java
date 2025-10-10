package com.endo4life.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.endo4life.web.rest.api.*;

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
}
