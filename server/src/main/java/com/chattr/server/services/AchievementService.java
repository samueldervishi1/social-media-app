package com.chattr.server.services;

import com.chattr.server.models.AchievementType;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class AchievementService {

  private final UserRepository userRepository;
  private final NotificationService notificationService;

  public AchievementService(
      UserRepository userRepository, NotificationService notificationService) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  public void evaluateAchievements(User user) {
    Set<AchievementType> newAchievements = new HashSet<>();

    if (user.getPostCount() >= 1) {
      newAchievements.add(AchievementType.FIRST_POST);
    }
    if (user.getLikeCount() >= 1) {
      newAchievements.add(AchievementType.FIRST_LIKE);
    }
    if (user.getCommentCount() >= 1) {
      newAchievements.add(AchievementType.FIRST_COMMENT);
    }
    if (user.getLikeCount() >= 10) {
      newAchievements.add(AchievementType.TEN_LIKES);
    }
    if (user.getPostCount() >= 10) {
      newAchievements.add(AchievementType.TEN_POSTS);
    }
    if (user.getLoginStreak() >= 7) {
      newAchievements.add(AchievementType.WEEKLY_STREAK);
    }
    if (user.getLoginStreak() >= 30) {
      newAchievements.add(AchievementType.MONTHLY_STREAK);
    }

    boolean updated = user.getAchievements().addAll(newAchievements);

    if (updated) {
      userRepository.save(user);
      notifyUser(user, newAchievements);
    }
  }

  private void notifyUser(User user, Set<AchievementType> newAchievements) {
    for (AchievementType achievement : newAchievements) {
      notificationService.sendAchievementNotification(
          user.getId(), user.getUsername(), achievement);
    }
  }
}
