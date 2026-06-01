package sway.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Adds public Cache-Control + stale-while-revalidate to GET /api responses
 * (skips the SSE stream). Path-based, so it never touches response bodies.
 */
@Component
public class CacheControlInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) return true;
        String uri = request.getRequestURI();
        if (uri == null || !uri.startsWith("/api/")) return true;
        if (uri.startsWith("/api/stream")) return true;

        int maxAge;
        int swr;
        if (uri.startsWith("/api/servers") || uri.equals("/api/players/status")) {
            maxAge = 5;  swr = 30;
        } else if (uri.startsWith("/api/players/page")) {
            maxAge = 15; swr = 30;
        } else if (uri.startsWith("/api/players/potw")) {
            maxAge = 300; swr = 600;
        } else if (uri.startsWith("/api/cheaters") || uri.startsWith("/api/jumps")) {
            maxAge = 60; swr = 120;
        } else if (uri.contains("/rank/")) {
            maxAge = 30; swr = 60;
        } else if (uri.startsWith("/api/players/")) {
            // profile by id
            maxAge = 20; swr = 60;
        } else {
            // count, all, fallback
            maxAge = 30; swr = 60;
        }

        response.setHeader(HttpHeaders.CACHE_CONTROL,
            "public, max-age=" + maxAge + ", stale-while-revalidate=" + swr);
        return true;
    }
}
