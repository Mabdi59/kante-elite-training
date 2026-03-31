package com.kanteelite.training.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = Paths.get(uploadsDirectory)
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        if (!resourceLocation.endsWith("/")) {
            resourceLocation = resourceLocation + "/";
        }

        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}

