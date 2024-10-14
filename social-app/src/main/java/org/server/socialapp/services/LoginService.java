package org.server.socialapp.services;

import org.server.socialapp.exceptions.BadRequestException;
import org.server.socialapp.exceptions.InternalServerErrorException;
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
        try {
            logger.info("Attempting to login with username {}", username);

            User user = userRepository.findByUsername(username);
            if (user == null) {
                logger.warn("User with username: {} not found", username);
                throw new NotFoundException("Username not found");
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Password mismatch for username: {}", username);
                throw new BadRequestException("Invalid username or password");
            }

            String token = jwtTokenUtil.generateToken(username, user.getId());
            logger.info("Successfully logged in user: {}", username);
            return token;

        } catch (NotFoundException | BadRequestException e) {
            logger.error("Error during login: {}", e.getMessage());
            throw e;

        } catch (Exception e) {
            logger.error("Unexpected error occurred during login: {}", e.getMessage());
            throw new InternalServerErrorException("Error during login");
        }
    }
}
