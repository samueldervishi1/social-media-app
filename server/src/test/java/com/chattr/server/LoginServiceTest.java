package com.chattr.server;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.services.AchievementService;
import com.chattr.server.services.EmailService;
import com.chattr.server.services.LoginService;
import com.chattr.server.utils.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.*;

public class LoginServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenUtil jwtTokenUtil;
    private EmailService emailService;
    private AchievementService achievementService;
    private LoginService loginService;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtTokenUtil = mock(JwtTokenUtil.class);
        emailService = mock(EmailService.class);
        achievementService = mock(AchievementService.class);
        loginService = new LoginService(userRepository, passwordEncoder, jwtTokenUtil, emailService, achievementService);
    }

    @Test
    void login_shouldReturnToken_whenCredentialsAreValid() {
        User user = new User();
        user.setId("1");
        user.setUsername("sam");
        user.setPassword("hashed_password");
        user.setEmail("sam@example.com");
        user.setTwoFa(false);
        user.setLastLoginIp("192.168.1.2");

        when(userRepository.findByUsername("sam")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "hashed_password")).thenReturn(true);
        when(jwtTokenUtil.generateToken("sam", "1", false)).thenReturn("mocked_jwt");

        String token = loginService.login("sam", "123456", "10.0.0.1");

        assertThat(token).isEqualTo("mocked_jwt");
        verify(emailService).sendSecurityAlert(eq("sam@example.com"), eq("10.0.0.1"));
        verify(achievementService).evaluateAchievements(eq(user));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void login_shouldThrow_whenUsernameNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loginService.login("ghost", "pw", "1.1.1.1"))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Invalid username or password");
    }

    @Test
    void login_shouldThrow_whenPasswordInvalid() {
        User user = new User();
        user.setPassword("correct_hash");

        when(userRepository.findByUsername("sam")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "correct_hash")).thenReturn(false);

        assertThatThrownBy(() -> loginService.login("sam", "wrong", "1.1.1.1"))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Invalid username or password");
    }
}
