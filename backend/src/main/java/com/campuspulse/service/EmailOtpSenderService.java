package com.campuspulse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailOtpSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailOtpSenderService.class);

    private final JavaMailSender mailSender;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${RESEND_API_KEY:${resend.api-key:}}")
    private String resendApiKey;

    @Value("${RESEND_FROM:${resend.from:Campus Pulse <onboarding@resend.dev>}}")
    private String resendFrom;

    @Value("${spring.mail.username:}")
    private String mailSenderUsername;

    @Value("${app.mail.from-address:noreply@amity.edu}")
    private String fromAddress;

    @Value("${app.mail.from-name:Amity University Dispatch Portal}")
    private String fromName;

    public EmailOtpSenderService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendOtpEmail(String toEmail, String otpCode, String purpose, int validityMinutes) {
        // Priority 1: Try Resend REST API if key is present
        if (resendApiKey != null && resendApiKey.startsWith("re_") && !resendApiKey.contains("YOUR_API_KEY")) {
            boolean resendSuccess = sendViaResend(toEmail, otpCode, purpose, validityMinutes);
            if (resendSuccess) {
                return true;
            }
        }

        // Priority 2: Try standard JavaMail / SMTP (e.g. Gmail App Password or Brevo)
        if (mailSender != null && mailSenderUsername != null && !mailSenderUsername.trim().isEmpty() && !mailSenderUsername.contains("your.email@gmail.com")) {
            return sendViaSmtp(toEmail, otpCode, purpose, validityMinutes);
        }

        log.warn("⚠️ Live email delivery not active for [{}]. OTP [{}] logged to console.", toEmail, otpCode);
        return false;
    }

    private boolean sendViaResend(String toEmail, String otpCode, String purpose, int validityMinutes) {
        try {
            String subject = "Your Amity University Verification Passcode: " + otpCode;
            String htmlContent = buildEmailTemplate(toEmail, otpCode, purpose, validityMinutes);

            Map<String, Object> payload = Map.of(
                    "from", resendFrom,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "html", htmlContent
            );

            String requestJson = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("📧 [Resend] Successfully dispatched OTP email to [{}] for purpose [{}]", toEmail, purpose);
                return true;
            } else if (response.statusCode() == 403 && response.body().contains("only send testing emails to your own email address")) {
                log.warn("⚠️ [Resend Sandbox Restriction] Resend free sandbox can only deliver to your verified account email address. To deliver to [{}] on Amity Outlook directly, add Gmail App Password to backend/.env! OTP [{}] is available in dev console.", toEmail, otpCode);
                return false;
            } else {
                log.warn("⚠️ [Resend] Failed with status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("❌ [Resend] Exception sending email to [{}]: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private boolean sendViaSmtp(String toEmail, String otpCode, String purpose, int validityMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your Amity University Verification Passcode: " + otpCode);

            String htmlContent = buildEmailTemplate(toEmail, otpCode, purpose, validityMinutes);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 [SMTP] Successfully dispatched OTP email to [{}] for purpose [{}]", toEmail, purpose);
            return true;
        } catch (Exception e) {
            log.error("❌ [SMTP] Failed to send OTP email to [{}]: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private String buildEmailTemplate(String email, String otpCode, String purpose, int validityMinutes) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:24px;background-color:#080c14;font-family:Arial,Helvetica,sans-serif;color:#f1f5f9;'>"
                + "  <div style='max-width:540px;margin:0 auto;background:#0f172a;border:1.5px solid #f59e0b;border-radius:12px;padding:32px;box-shadow:0 12px 36px rgba(0,0,0,0.5);'>"
                + "    <div style='text-align:center;margin-bottom:24px;'>"
                + "      <div style='display:inline-block;padding:8px 16px;background:rgba(245,158,11,0.15);border:1px solid #f59e0b;border-radius:6px;color:#fbbf24;font-weight:700;font-size:14px;letter-spacing:1px;'>"
                + "        AMITY UNIVERSITY"
                + "      </div>"
                + "      <h2 style='color:#f8fafc;margin:16px 0 6px;font-size:22px;'>Campus Pulse Dispatch Portal</h2>"
                + "      <p style='color:#94a3b8;font-size:13px;margin:0;'>Identity Verification & Account Dispatch Service</p>"
                + "    </div>"
                + "    <div style='background:#15203b;border-radius:8px;padding:20px;border:1px solid rgba(148,163,184,0.2);margin-bottom:20px;'>"
                + "      <p style='margin:0 0 12px;color:#cbd5e1;font-size:14px;'>"
                + "        Hello Amity member, you requested a one-time passcode (OTP) for <strong>" + purpose + "</strong>."
                + "      </p>"
                + "      <div style='background:#080c14;border:2px dashed #f59e0b;border-radius:8px;padding:16px;text-align:center;margin:18px 0;'>"
                + "        <span style='font-family:monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#fbbf24;display:block;'>"
                +            otpCode
                + "        </span>"
                + "        <span style='font-size:12px;color:#94a3b8;display:block;margin-top:6px;'>"
                + "          Valid for " + validityMinutes + " minutes"
                + "        </span>"
                + "      </div>"
                + "      <p style='font-size:12px;color:#94a3b8;margin:0;line-height:1.5;'>"
                + "        Do not share this code with anyone. Official campus IT and administrative staff will never ask for your verification passcode."
                + "      </p>"
                + "    </div>"
                + "    <div style='background:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:10px 14px;font-size:12px;color:#fca5a5;border-radius:4px;'>"
                + "      ⚠️ <strong>University Moderation Notice:</strong> False registrations or unauthorized access attempts are strictly monitored and escalated to the Campus Disciplinary Board."
                + "    </div>"
                + "    <div style='text-align:center;margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;font-size:11px;color:#64748b;'>"
                + "      Amity University • Campus Infrastructure & Incident Dispatch • Automated Notification"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }
}
