package org.capgemini.investmentservice.repository;

import org.capgemini.investmentservice.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByStartupId(Long startupId);
    List<Investment> findByInvestorEmail(String investorEmail);
}
