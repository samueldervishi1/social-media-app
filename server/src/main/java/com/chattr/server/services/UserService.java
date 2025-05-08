package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.chattr.server.models.Codes.*;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserInfo(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND_BY_USERNAME, username)));
    }

    public String getUsernameById(String userId) {
        return userRepository.findById(userId)
                .map(User::getUsername)
                .orElseThrow(() -> new CustomException(404, USER_NOT_FOUND_BY_ID));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}