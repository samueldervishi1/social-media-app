/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.server.socialapp.repositories;

/**
 * @author samuel
 */

import org.server.socialapp.models.UserVideoActions;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface UserVideoActionsRepository extends MongoRepository<UserVideoActions, String> {
    Optional<UserVideoActions> findByUserId(String userId);
}

