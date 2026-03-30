package org.capgemini.startupservice.repository;

import org.capgemini.startupservice.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    List<Follow> findByInvestorEmail(String investorEmail);
    Optional<Follow> findByInvestorEmailAndStartupId(String investorEmail, Long startupId);
    boolean existsByInvestorEmailAndStartupId(String investorEmail, Long startupId);
}
