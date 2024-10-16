package org.server.socialapp.services;

import org.server.socialapp.exceptions.BadRequestException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.UserRepository;
import org.server.socialapp.util.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private static final Logger logger = LoggerFactory.getLogger(LoginService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public String login(String username, String password) {
        logger.info("Attempting to login with username {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username not found"));

        validatePassword(password, user.getPassword());

        String token = jwtTokenUtil.generateToken(username, user.getId());
        logger.info("Successfully logged in user: {}", username);
        return token;
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            logger.warn("Password mismatch for username: {}", encodedPassword);
            throw new BadRequestException("Invalid username or password");
        }
    }
}
