package com.kaserdokan.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry r){ r.addMapping("/**").allowedOriginPatterns("*").allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("*"); }
    @Override public void addResourceHandlers(ResourceHandlerRegistry r){ r.addResourceHandler("/uploads/**").addResourceLocations("file:uploads/"); }
}
