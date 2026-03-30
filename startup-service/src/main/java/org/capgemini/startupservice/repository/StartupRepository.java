package org.capgemini.startupservice.repository;

import org.capgemini.startupservice.entity.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StartupRepository extends JpaRepository<Startup, Long> {
    List<Startup> findByFounderEmail(String founderEmail);
}
