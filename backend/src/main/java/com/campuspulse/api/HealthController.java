package com.campuspulse.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check endpoint. Not secured — must return 200 for load balancers and CI checks.
 */
@Tag(name = "Health", description = "Service health and readiness")
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private static final String VERSION = "1.0.0";

    @Operation(summary = "Health check", description = "Returns UP when the service is running and the database is reachable.")
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "version", VERSION,
                "timestamp", Instant.now().toString()
        ));
    }
}
