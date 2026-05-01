package org.capgemini.startupservice.repository;

import org.capgemini.startupservice.entity.Startup;
import org.capgemini.startupservice.entity.StartupStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;



@DataJpaTest
@ActiveProfiles("test")
class StartupRepositoryTest {

    @Autowired
    private StartupRepository startupRepository;

    @Test
    void testSaveAndFindById() {
        Startup startup = new Startup();
        startup.setStartupName("Test Startup");
        startup.setFounderEmail("founder@test.com");
        startup.setStatus(StartupStatus.PENDING);

        Startup saved = startupRepository.save(startup);
        
        Optional<Startup> found = startupRepository.findById(saved.getId());
        
        assertThat(found).isPresent();
        assertThat(found.get().getStartupName()).isEqualTo("Test Startup");
    }

    @Test
    void testDelete() {
        Startup startup = new Startup();
        startup.setStartupName("To Be Deleted");
        startup.setFounderEmail("delete@test.com");
        startup.setStatus(StartupStatus.PENDING);

        Startup saved = startupRepository.save(startup);
        startupRepository.delete(saved);
        
        Optional<Startup> found = startupRepository.findById(saved.getId());
        assertThat(found).isNotPresent();
    }
}
