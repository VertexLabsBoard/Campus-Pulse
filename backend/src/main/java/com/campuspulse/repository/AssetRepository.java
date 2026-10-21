package com.campuspulse.repository;

import com.campuspulse.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    Optional<Asset> findByQrToken(String qrToken);
    Optional<Asset> findByAssetTag(String assetTag);
    List<Asset> findByLocationId(UUID locationId);
}
