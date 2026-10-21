package com.campuspulse.service;

import com.campuspulse.domain.Otp;
import com.campuspulse.exception.BadRequestException;
import com.campuspulse.repository.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_VALIDITY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final OtpRepository otpRepository;
    private final EmailOtpSenderService emailOtpSenderService;

    public OtpService(OtpRepository otpRepository, EmailOtpSenderService emailOtpSenderService) {
        this.otpRepository = otpRepository;
        this.emailOtpSenderService = emailOtpSenderService;
    }

    @Transactional
    public String generateOtp(String email, String purpose) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanPurpose = purpose.trim().toUpperCase();
        Instant now = Instant.now();

        // Check if there is an existing unverified OTP with active resend cooldown
        Optional<Otp> existingOpt = otpRepository.findTopByEmailIgnoreCaseAndPurposeOrderByCreatedAtDesc(cleanEmail, cleanPurpose);
        if (existingOpt.isPresent()) {
            Otp existing = existingOpt.get();
            if (!existing.isVerified() && now.isBefore(existing.getResendAllowedAfter())) {
                long waitSec = ChronoUnit.SECONDS.between(now, existing.getResendAllowedAfter());
                throw new BadRequestException("Please wait " + Math.max(waitSec, 1) + " seconds before requesting another OTP.");
            }
        }

        String otpCode = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = now.plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES);
        Instant resendAfter = now.plus(30, ChronoUnit.SECONDS);

        Otp otp = new Otp(cleanEmail, cleanPurpose, otpCode, expiresAt, resendAfter);
        otpRepository.save(otp);

        log.info("🔐 AMITY OTP generated and stored in database for [{}] [purpose={}]: {} (valid for {} mins)",
                cleanEmail, cleanPurpose, otpCode, OTP_VALIDITY_MINUTES);

        // Dispatch real email via SMTP
        emailOtpSenderService.sendOtpEmail(cleanEmail, otpCode, cleanPurpose, OTP_VALIDITY_MINUTES);

        return otpCode;
    }

    @Transactional
    public void verifyOtp(String email, String purpose, String inputOtp) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanPurpose = purpose.trim().toUpperCase();

        Otp otp = otpRepository.findTopByEmailIgnoreCaseAndPurposeOrderByCreatedAtDesc(cleanEmail, cleanPurpose)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new OTP."));

        if (otp.isVerified()) {
            throw new BadRequestException("OTP has already been used. Please request a new OTP.");
        }

        if (Instant.now().isAfter(otp.getExpiresAt())) {
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new BadRequestException("Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        if (!otp.getOtpCode().equals(inputOtp.trim())) {
            otp.incrementAttempts();
            otpRepository.save(otp);
            int remaining = MAX_ATTEMPTS - otp.getAttempts();
            throw new BadRequestException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // OTP matched successfully: mark verified in DB
        otp.setVerified(true);
        otpRepository.save(otp);
        log.info("✅ AMITY OTP successfully verified and persisted for [{}] [purpose={}]", cleanEmail, cleanPurpose);
    }
}

