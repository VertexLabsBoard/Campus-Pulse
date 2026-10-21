package com.campuspulse.api;

import com.campuspulse.domain.Building;
import com.campuspulse.domain.Issue;
import com.campuspulse.domain.Location;
import com.campuspulse.exception.NotFoundException;
import com.campuspulse.repository.BuildingRepository;
import com.campuspulse.repository.IssueRepository;
import com.campuspulse.repository.LocationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Locations & Buildings", description = "Location hierarchy and QR token lookup")
public class LocationController {

    private final BuildingRepository buildingRepository;
    private final LocationRepository locationRepository;
    private final IssueRepository issueRepository;
    private final com.campuspulse.repository.DepartmentRepository departmentRepository;

    public LocationController(
            BuildingRepository buildingRepository,
            LocationRepository locationRepository,
            IssueRepository issueRepository,
            com.campuspulse.repository.DepartmentRepository departmentRepository) {
        this.buildingRepository = buildingRepository;
        this.locationRepository = locationRepository;
        this.issueRepository = issueRepository;
        this.departmentRepository = departmentRepository;
    }

    public static class LocationDetailDto {
        private UUID id;
        private UUID buildingId;
        private String buildingName;
        private String buildingCode;
        private Short floor;
        private String roomCode;
        private String name;
        private String qrToken;
        private Location.Type type;
        private List<Issue> activeIssues;

        public LocationDetailDto() {}

        public LocationDetailDto(UUID id, UUID buildingId, String buildingName, String buildingCode, Short floor, String roomCode, String name, String qrToken, Location.Type type, List<Issue> activeIssues) {
            this.id = id;
            this.buildingId = buildingId;
            this.buildingName = buildingName;
            this.buildingCode = buildingCode;
            this.floor = floor;
            this.roomCode = roomCode;
            this.name = name;
            this.qrToken = qrToken;
            this.type = type;
            this.activeIssues = activeIssues;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getBuildingId() { return buildingId; }
        public void setBuildingId(UUID buildingId) { this.buildingId = buildingId; }

        public String getBuildingName() { return buildingName; }
        public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

        public String getBuildingCode() { return buildingCode; }
        public void setBuildingCode(String buildingCode) { this.buildingCode = buildingCode; }

        public Short getFloor() { return floor; }
        public void setFloor(Short floor) { this.floor = floor; }

        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }

        public Location.Type getType() { return type; }
        public void setType(Location.Type type) { this.type = type; }

        public List<Issue> getActiveIssues() { return activeIssues; }
        public void setActiveIssues(List<Issue> activeIssues) { this.activeIssues = activeIssues; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private UUID buildingId;
            private String buildingName;
            private String buildingCode;
            private Short floor;
            private String roomCode;
            private String name;
            private String qrToken;
            private Location.Type type;
            private List<Issue> activeIssues;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder buildingId(UUID buildingId) { this.buildingId = buildingId; return this; }
            public Builder buildingName(String buildingName) { this.buildingName = buildingName; return this; }
            public Builder buildingCode(String buildingCode) { this.buildingCode = buildingCode; return this; }
            public Builder floor(Short floor) { this.floor = floor; return this; }
            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
            public Builder type(Location.Type type) { this.type = type; return this; }
            public Builder activeIssues(List<Issue> activeIssues) { this.activeIssues = activeIssues; return this; }

            public LocationDetailDto build() {
                return new LocationDetailDto(id, buildingId, buildingName, buildingCode, floor, roomCode, name, qrToken, type, activeIssues);
            }
        }
    }

    @GetMapping("/departments")
    @Operation(summary = "List all campus operational departments")
    public ResponseEntity<List<com.campuspulse.domain.Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/buildings")
    @Operation(summary = "List all campus buildings")
    public ResponseEntity<List<Building>> getBuildings() {
        return ResponseEntity.ok(buildingRepository.findAll());
    }

    @GetMapping("/locations")
    @Operation(summary = "List all locations")
    public ResponseEntity<List<Location>> getLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @GetMapping("/locations/qr/{qrToken}")
    @Operation(summary = "Lookup location by QR token with known active issues")
    public ResponseEntity<LocationDetailDto> getLocationByQr(@PathVariable String qrToken) {
        Location loc = locationRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new NotFoundException("Location not found for QR token: " + qrToken));

        Building building = buildingRepository.findById(loc.getBuildingId()).orElse(null);

        // Fetch known open issues (excluding RESOLVED, CLOSED, REJECTED, DUPLICATE)
        Set<Issue.Status> closedStatuses = Set.of(
                Issue.Status.RESOLVED,
                Issue.Status.CLOSED,
                Issue.Status.REJECTED,
                Issue.Status.DUPLICATE
        );
        List<Issue> activeIssues = issueRepository.findByLocationIdAndStatusNotIn(loc.getId(), closedStatuses);

        LocationDetailDto dto = LocationDetailDto.builder()
                .id(loc.getId())
                .buildingId(loc.getBuildingId())
                .buildingName(building != null ? building.getName() : "Main Campus")
                .buildingCode(building != null ? building.getCode() : "CAMPUS")
                .floor(loc.getFloor())
                .roomCode(loc.getRoomCode())
                .name(loc.getName())
                .qrToken(loc.getQrToken())
                .type(loc.getType())
                .activeIssues(activeIssues)
                .build();

        return ResponseEntity.ok(dto);
    }
}
