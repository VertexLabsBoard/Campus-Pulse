package com.campuspulse.api;

import com.campuspulse.domain.Notification;
import com.campuspulse.repository.NotificationRepository;
import com.campuspulse.security.UserPrincipal;
import com.campuspulse.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app notifications for ticket status and assignments")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationController(NotificationRepository notificationRepository, AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    public static class NotificationsListDto {
        private List<Notification> notifications;
        private long unreadCount;

        public NotificationsListDto() {}

        public NotificationsListDto(List<Notification> notifications, long unreadCount) {
            this.notifications = notifications;
            this.unreadCount = unreadCount;
        }

        public List<Notification> getNotifications() { return notifications; }
        public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }

        public long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private List<Notification> notifications;
            private long unreadCount;

            public Builder notifications(List<Notification> notifications) { this.notifications = notifications; return this; }
            public Builder unreadCount(long unreadCount) { this.unreadCount = unreadCount; return this; }

            public NotificationsListDto build() {
                return new NotificationsListDto(notifications, unreadCount);
            }
        }
    }

    @GetMapping
    @Operation(summary = "Get current user notifications")
    public ResponseEntity<NotificationsListDto> getNotifications() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        long unread = notificationRepository.countByUserIdAndReadAtIsNull(principal.getId());
        return ResponseEntity.ok(NotificationsListDto.builder().notifications(list).unreadCount(unread).build());
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, String>> markRead(@PathVariable UUID id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllRead() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        Instant now = Instant.now();
        list.forEach(n -> {
            if (n.getReadAt() == null) {
                n.setReadAt(now);
            }
        });
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
