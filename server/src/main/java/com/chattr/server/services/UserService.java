package com.chattr.server.services;

import static com.chattr.server.models.Messages.*;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.models.UserLiteDTO;
import com.chattr.server.repositories.UserRepository;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service for user data retrieval by username, ID, or all users. */
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
        return userRepository.findUsernameById(userId).map(User::getUsername)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND_BY_ID, userId)));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserLiteDTO> getFollowers(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new CustomException(404, String.format(USER_NOT_FOUND, userId));
        }

        User userWithFollowers = userRepository.findFollowersById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND, userId)));

        if (userWithFollowers.getFollowers() == null || userWithFollowers.getFollowers().isEmpty()) {
            return Collections.emptyList();
        }

        return userRepository.findUserLiteByIdIn(userWithFollowers.getFollowers()).stream()
                .map(u -> new UserLiteDTO(u.getId(), u.getUsername(), u.getFullName())).toList();
    }

    public List<UserLiteDTO> getFollowing(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new CustomException(404, String.format(USER_NOT_FOUND, userId));
        }

        User userWithFollowing = userRepository.findFollowingById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND, userId)));

        if (userWithFollowing.getFollowing() == null || userWithFollowing.getFollowing().isEmpty()) {
            return Collections.emptyList();
        }

        return userRepository.findUserLiteByIdIn(userWithFollowing.getFollowing()).stream()
                .map(u -> new UserLiteDTO(u.getId(), u.getUsername(), u.getFullName())).toList();
    }
}
