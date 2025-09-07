package com.endo4life;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class Endo4LifeApplication {

    public static void main(String[] args) {
        SpringApplication.run(Endo4LifeApplication.class, args);
    }
}
