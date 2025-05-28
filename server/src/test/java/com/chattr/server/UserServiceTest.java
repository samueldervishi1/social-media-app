package com.chattr.server;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.models.UserLiteDTO;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        userService = new UserService(userRepository);
    }

    @Test
    void getUserInfo_shouldReturnUser_whenUsernameExists() {
        User user = new User();
        user.setUsername("sam");

        when(userRepository.findByUsername("sam")).thenReturn(Optional.of(user));

        User result = userService.getUserInfo("sam");
        assertThat(result.getUsername()).isEqualTo("sam");
    }

    @Test
    void getUserInfo_shouldThrow_whenUsernameNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserInfo("ghost"))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("No user found with username: ghost");
    }

    @Test
    void getUsernameById_shouldReturnUsername_whenUserExists() {
        User user = new User();
        user.setId("123");
        user.setUsername("samuel");

        when(userRepository.findById("123")).thenReturn(Optional.of(user));

        String result = userService.getUsernameById("123");
        assertThat(result).isEqualTo("samuel");
    }

    @Test
    void getUsernameById_shouldThrow_whenUserNotFound() {
        when(userRepository.findById("999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUsernameById("999"))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("No user found with ID: 999");
    }

    @Test
    void getAllUsers_shouldReturnUserList() {
        User u1 = new User();
        u1.setUsername("u1");
        User u2 = new User();
        u2.setUsername("u2");

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<User> users = userService.getAllUsers();
        assertThat(users).hasSize(2);
    }

    @Test
    void getFollowers_shouldReturnLiteDTOs() {
        User user = new User();
        user.setId("123");
        user.setFollowers(List.of("f1", "f2"));

        User f1 = new User();
        f1.setId("f1");
        f1.setUsername("user1");
        f1.setFullName("User One");

        User f2 = new User();
        f2.setId("f2");
        f2.setUsername("user2");
        f2.setFullName("User Two");

        when(userRepository.findById("123")).thenReturn(Optional.of(user));
        when(userRepository.findByIdIn(List.of("f1", "f2"))).thenReturn(List.of(f1, f2));

        List<UserLiteDTO> result = userService.getFollowers("123");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUsername()).isEqualTo("user1");
    }

    @Test
    void getFollowing_shouldReturnLiteDTOs() {
        User user = new User();
        user.setId("123");
        user.setFollowing(List.of("u3", "u4"));

        User u3 = new User();
        u3.setId("u3");
        u3.setUsername("user3");
        u3.setFullName("User Three");

        User u4 = new User();
        u4.setId("u4");
        u4.setUsername("user4");
        u4.setFullName("User Four");

        when(userRepository.findById("123")).thenReturn(Optional.of(user));
        when(userRepository.findByIdIn(List.of("u3", "u4"))).thenReturn(List.of(u3, u4));

        List<UserLiteDTO> result = userService.getFollowing("123");

        assertThat(result).hasSize(2);
        assertThat(result.get(1).getFullName()).isEqualTo("User Four");
    }
}