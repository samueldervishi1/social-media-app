package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.models.UserLiteDTO;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.chattr.server.models.Messages.*;

/**
 * Service for user data retrieval by username, ID, or all users.
 */
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
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND_BY_ID, userId)));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserLiteDTO> getFollowers(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        return userRepository.findByIdIn(user.getFollowers())
                .stream()
                .map(u -> new UserLiteDTO(u.getId(), u.getUsername(), u.getFullName()))
                .toList();
    }

    public List<UserLiteDTO> getFollowing(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        return userRepository.findByIdIn(user.getFollowing())
                .stream()
                .map(u -> new UserLiteDTO(u.getId(), u.getUsername(), u.getFullName()))
                .toList();
    }

}