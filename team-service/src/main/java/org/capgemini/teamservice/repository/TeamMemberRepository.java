package org.capgemini.teamservice.repository;
import org.capgemini.teamservice.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByStartupId(Long startupId);
    List<TeamMember> findByInvitedUserEmail(String invitedUserEmail);
    Optional<TeamMember> findByIdAndInvitedUserEmail(Long id, String invitedUserEmail);
}
