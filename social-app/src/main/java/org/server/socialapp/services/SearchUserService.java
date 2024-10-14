package org.server.socialapp.services;

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
        return userRepository.findByUsernameContaining(username);
    }

    public List<User> searchUserByNameAndSurname(String given_name, String family_name) {
        return userRepository.findByGivenNameContainingAndFamilyNameContaining(given_name, family_name);
    }
}
