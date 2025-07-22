package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.Report;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.ReportPostRepository;
import com.chattr.server.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

/**
 * Service responsible for handling user-generated post-reports, duplicate
 * detection, and flagging posts as reported.
 */
@Service
public class ReportService {

    private final ReportPostRepository reportPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LoggingService loggingService;

    public ReportService(ReportPostRepository reportPostRepository, PostRepository postRepository,
            UserRepository userRepository, LoggingService loggingService) {
        this.reportPostRepository = reportPostRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.loggingService = loggingService;
    }

    public Report report(Report report) {
        String sessionId = loggingService.getCurrentSessionId();

        try {
            String userId = report.getUserId();
            String postId = report.getPostId();

            loggingService.logSecurityEvent("POST_REPORTED", userId, sessionId,
                    String.format("User reported post %s for reason: %s", postId, report.getReason()));

            rejectIfAlreadyReported(userId, postId);
            markPostAsReported(postId);
            updateUserReportedPosts(userId, postId);

            report.setReportTime(LocalDateTime.now());
            loggingService.logSecurityEvent("POST_REPORT_SUCCESS", userId, sessionId,
                    String.format("User reported post %s for reason: %s", postId, report.getReason()));
            return reportPostRepository.save(report);

        } catch (CustomException e) {
            loggingService.logSecurityEvent("POST_REPORTED_FAILED", report.getUserId(), sessionId,
                    String.format("User reported post %s for reason: %s", report.getPostId(), report.getReason()));
            loggingService.logError("ReportService", "report", "Error reporting", e);
            throw e;
        } catch (Exception e) {
            loggingService.logError("ReportService", "report", "Internal Server Error", e);
            throw new CustomException(500, Messages.REPORT_ERROR);
        }
    }

    private void rejectIfAlreadyReported(String userId, String postId) {
        if (reportPostRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new CustomException(400, String.format(Messages.USER_ALREADY_REPORTED, userId, postId));
        }
    }

    private void markPostAsReported(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(400, String.format(Messages.POST_NOT_FOUND, postId)));

        if (!post.isReported()) {
            post.setReported(true);
            postRepository.save(post);
        }
    }

    private void updateUserReportedPosts(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));

        if (user.getReportedPostIds() == null) {
            user.setReportedPostIds(new ArrayList<>());
        }

        if (!user.getReportedPostIds().contains(postId)) {
            user.getReportedPostIds().add(postId);
            userRepository.save(user);
        }
    }
}
