package org.capgemini.authservice.security;

import org.capgemini.authservice.entity.Role;
import org.capgemini.authservice.entity.RoleName;
import org.capgemini.authservice.entity.User;
import org.capgemini.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_shouldReturnUserDetailsWhenUserExists() {
        User user = new User();
        user.setId(1L);
        user.setName("Rahul");
        user.setEmail("rahul@test.com");
        user.setPassword("encoded-password");
        user.setRoles(Set.of(new Role(RoleName.ROLE_FOUNDER)));

        when(userRepository.findByEmail("rahul@test.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("rahul@test.com");

        assertThat(result.getUsername()).isEqualTo("rahul@test.com");
        assertThat(result.getPassword()).isEqualTo("encoded-password");
        assertThat(result.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_FOUNDER");
        verify(userRepository).findByEmail("rahul@test.com");
    }

    @Test
    void loadUserByUsername_shouldThrowExceptionWhenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("missing@test.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User Not Found with email: missing@test.com");

        verify(userRepository).findByEmail("missing@test.com");
    }
}
