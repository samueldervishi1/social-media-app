package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchUserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> searchUser(String username) {
        try {
            return userRepository.findByUsernameContaining(username);
        } catch (Exception e) {
            System.err.println("Error searching for user by username: " + e.getMessage());
            throw new InternalServerErrorException("Error searching for user by username");
        }
    }

    public List<User> searchUserByNameAndSurname(String givenName, String familyName) {
        try {
            return userRepository.findByGivenNameContainingAndFamilyNameContaining(givenName, familyName);
        } catch (Exception e) {
            System.err.println("Error searching for user by name and surname: " + e.getMessage());
            throw new InternalServerErrorException("Error searching for user by name and surname");
        }
    }
}
