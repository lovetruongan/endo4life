package com.endo4life.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.endo4life.web.rest.api.UserV1ApiController;
import com.endo4life.web.rest.api.ResourceV1ApiController;
import com.endo4life.web.rest.api.CourseV1ApiController;
import com.endo4life.web.rest.api.UserV1ApiDelegate;
import com.endo4life.web.rest.api.ResourceV1ApiDelegate;
import com.endo4life.web.rest.api.CourseV1ApiDelegate;

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
}
