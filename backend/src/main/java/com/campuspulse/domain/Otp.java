package com.campuspulse.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "otps")
public class Otp extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 50)
    private String purpose;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "resend_allowed_after", nullable = false)
    private Instant resendAllowedAfter;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private boolean verified = false;

    public Otp() {}

    public Otp(String email, String purpose, String otpCode, Instant expiresAt, Instant resendAllowedAfter) {
        this.email = email;
        this.purpose = purpose;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
        this.resendAllowedAfter = resendAllowedAfter;
        this.attempts = 0;
        this.verified = false;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getResendAllowedAfter() { return resendAllowedAfter; }
    public void setResendAllowedAfter(Instant resendAllowedAfter) { this.resendAllowedAfter = resendAllowedAfter; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public void incrementAttempts() { this.attempts++; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
