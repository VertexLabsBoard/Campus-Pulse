package com.campuspulse.repository;

import com.campuspulse.domain.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    Optional<Location> findByQrToken(String qrToken);
    List<Location> findByBuildingId(UUID buildingId);
}
