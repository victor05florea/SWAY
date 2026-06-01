package sway.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String CSP_DIRECTIVES = String.join("; ",
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https://avatars.steamstatic.com https://avatars.akamai.steamstatic.com https://avatars.cloudflare.steamstatic.com https://api.dicebear.com",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests"
    );

    @Value("${sway.security.hsts-max-age}")
    private long hstsMaxAge;

    @Value("${sway.security.csp-mode}")
    private String cspMode;

    @Value("${sway.security.csp-report-uri}")
    private String cspReportUri;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // HSTS — preload-ready (2y default). Set only on HTTPS; nginx terminates TLS, X-Forwarded-Proto signals it.
        String proto = req.getHeader("X-Forwarded-Proto");
        boolean isHttps = "https".equalsIgnoreCase(proto) || req.isSecure();
        if (isHttps) {
            res.setHeader("Strict-Transport-Security",
                "max-age=" + hstsMaxAge + "; includeSubDomains; preload");
        }

        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("Permissions-Policy",
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Resource-Policy", "same-site");

        String cspValue = CSP_DIRECTIVES;
        if (cspReportUri != null && !cspReportUri.isBlank()) {
            cspValue = cspValue + "; report-uri " + cspReportUri;
        }
        if ("enforce".equalsIgnoreCase(cspMode)) {
            res.setHeader("Content-Security-Policy", cspValue);
        } else {
            res.setHeader("Content-Security-Policy-Report-Only", cspValue);
        }

        chain.doFilter(req, res);
    }
}
