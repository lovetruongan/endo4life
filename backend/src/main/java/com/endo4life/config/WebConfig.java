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
    public com.endo4life.web.rest.api.WebhookV1ApiController webhookV1ApiController(
            com.endo4life.web.rest.api.WebhookV1ApiDelegate delegate) {
        return new com.endo4life.web.rest.api.WebhookV1ApiController(delegate);
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
}
