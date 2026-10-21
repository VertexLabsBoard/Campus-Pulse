package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "locations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"building_id","floor","room_code"}))
public class Location extends BaseEntity {

    public enum Type { CLASSROOM, LAB, CORRIDOR, WASHROOM, OTHER }

    @Column(name = "building_id", nullable = false)
    private UUID buildingId;

    @Column(nullable = false)
    private Short floor;

    @Column(name = "room_code", nullable = false, length = 50)
    private String roomCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "qr_token", nullable = false, unique = true, length = 100)
    private String qrToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    public Location() {}

    public Location(UUID buildingId, Short floor, String roomCode, String name, String qrToken, Type type) {
        this.buildingId = buildingId;
        this.floor = floor;
        this.roomCode = roomCode;
        this.name = name;
        this.qrToken = qrToken;
        this.type = type;
    }

    public static LocationBuilder builder() {
        return new LocationBuilder();
    }

    public static class LocationBuilder {
        private UUID buildingId;
        private Short floor;
        private String roomCode;
        private String name;
        private String qrToken;
        private Type type;

        public LocationBuilder buildingId(UUID buildingId) { this.buildingId = buildingId; return this; }
        public LocationBuilder floor(Short floor) { this.floor = floor; return this; }
        public LocationBuilder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
        public LocationBuilder name(String name) { this.name = name; return this; }
        public LocationBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public LocationBuilder type(Type type) { this.type = type; return this; }

        public Location build() {
            return new Location(buildingId, floor, roomCode, name, qrToken, type);
        }
    }

    public UUID getBuildingId() { return buildingId; }
    public void setBuildingId(UUID buildingId) { this.buildingId = buildingId; }
    public Short getFloor() { return floor; }
    public void setFloor(Short floor) { this.floor = floor; }
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
}
