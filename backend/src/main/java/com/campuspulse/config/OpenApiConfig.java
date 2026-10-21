package com.campuspulse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI campusPulseOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Campus Pulse API")
                .version("v1")
                .description("Campus issue reporting and resolution tracking platform")
                .contact(new Contact()
                    .name("Campus Pulse Team")
                    .email("campuspulse@college.edu")
                )
            );
    }
}
