package com.chattr.server;

import com.chattr.server.repositories.UserRepository;
import com.chattr.server.services.AchievementService;
import com.chattr.server.services.EmailService;
import com.chattr.server.services.LoginService;
import com.chattr.server.utils.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.mock;

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

    
}
