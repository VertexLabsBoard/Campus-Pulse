package com.campuspulse.repository;

import com.campuspulse.domain.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findTopByEmailIgnoreCaseAndPurposeOrderByCreatedAtDesc(String email, String purpose);
    void deleteByEmailIgnoreCaseAndPurpose(String email, String purpose);
}
