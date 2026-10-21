package com.campuspulse.repository;

import com.campuspulse.domain.Issue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID>, JpaSpecificationExecutor<Issue> {

    Optional<Issue> findByTicketNo(String ticketNo);

    List<Issue> findByReporterIdOrderByCreatedAtDesc(UUID reporterId);

    Page<Issue> findByReporterId(UUID reporterId, Pageable pageable);

    List<Issue> findByLocationIdAndStatusNotIn(UUID locationId, Collection<Issue.Status> closedStatuses);

    List<Issue> findByAssetIdAndStatusNotIn(UUID assetId, Collection<Issue.Status> closedStatuses);

    Page<Issue> findByDepartmentId(UUID departmentId, Pageable pageable);

    Page<Issue> findByAssigneeId(UUID assigneeId, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.reporterId = :reporterId AND i.createdAt >= :since")
    long countReportsSince(@Param("reporterId") UUID reporterId, @Param("since") Instant since);
}
