package sway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableScheduling
public class WebConfig implements WebMvcConfigurer {

    @Value("${sway.cors.allowed-origins}")
    private String allowedOrigins;

    private final CacheControlInterceptor cacheControlInterceptor;

    public WebConfig(CacheControlInterceptor cacheControlInterceptor) {
        this.cacheControlInterceptor = cacheControlInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(cacheControlInterceptor).addPathPatterns("/api/**");
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration cfg = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split("\\s*,\\s*"));
        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(Arrays.asList("Content-Length", "Cache-Control", "ETag"));
        cfg.setAllowCredentials(false);
        cfg.setMaxAge(3600L);
        source.registerCorsConfiguration("/api/**", cfg);
        return new CorsFilter(source);
    }
}
