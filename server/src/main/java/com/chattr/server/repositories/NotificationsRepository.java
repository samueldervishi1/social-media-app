package com.chattr.server.repositories;

import com.chattr.server.models.Notifications;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationsRepository extends MongoRepository<Notifications, String> {}
