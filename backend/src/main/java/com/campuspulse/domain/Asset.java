package com.campuspulse.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "assets")
public class Asset extends BaseEntity {

    public enum Type   { PROJECTOR, AC, PC, LIGHT, OTHER }
    public enum Status { ACTIVE, RETIRED, MAINTENANCE }

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 100)
    private String assetTag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    @Column(name = "qr_token", nullable = false, unique = true, length = 100)
    private String qrToken;

    @Column(name = "installed_on")
    private LocalDate installedOn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.ACTIVE;

    public Asset() {}

    public Asset(UUID locationId, String assetTag, Type type, String qrToken, LocalDate installedOn, Status status) {
        this.locationId = locationId;
        this.assetTag = assetTag;
        this.type = type;
        this.qrToken = qrToken;
        this.installedOn = installedOn;
        this.status = status;
    }

    public static AssetBuilder builder() {
        return new AssetBuilder();
    }

    public static class AssetBuilder {
        private UUID locationId;
        private String assetTag;
        private Type type;
        private String qrToken;
        private LocalDate installedOn;
        private Status status = Status.ACTIVE;

        public AssetBuilder locationId(UUID locationId) { this.locationId = locationId; return this; }
        public AssetBuilder assetTag(String assetTag) { this.assetTag = assetTag; return this; }
        public AssetBuilder type(Type type) { this.type = type; return this; }
        public AssetBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public AssetBuilder installedOn(LocalDate installedOn) { this.installedOn = installedOn; return this; }
        public AssetBuilder status(Status status) { this.status = status; return this; }

        public Asset build() {
            return new Asset(locationId, assetTag, type, qrToken, installedOn, status);
        }
    }

    public UUID getLocationId() { return locationId; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }
    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public LocalDate getInstalledOn() { return installedOn; }
    public void setInstalledOn(LocalDate installedOn) { this.installedOn = installedOn; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
