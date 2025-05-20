package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.Report;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.ReportPostRepository;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

/**
 * Service responsible for handling user-generated post reports,
 * duplicate detection, and flagging posts as reported.
 */
@Service
public class ReportService {

    private final ReportPostRepository reportPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public ReportService(ReportPostRepository reportPostRepository, PostRepository postRepository, UserRepository userRepository) {
        this.reportPostRepository = reportPostRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Submits a report for a post by a user.
     *
     * @param report the report object containing userId and postId
     * @return saved a Report object
     */
    public Report report(Report report) {
        try {
            String userId = report.getUserId();
            String postId = report.getPostId();

            rejectIfAlreadyReported(userId, postId);
            markPostAsReported(postId);
            updateUserReportedPosts(userId, postId);

            report.setReportTime(LocalDateTime.now());
            return reportPostRepository.save(report);

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(500, Messages.REPORT_ERROR);
        }
    }

    /**
     * Checks for existing report by this user on this post.
     */
    private void rejectIfAlreadyReported(String userId, String postId) {
        if (reportPostRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new CustomException(400, String.format(Messages.USER_ALREADY_REPORTED, userId, postId));
        }
    }

    /**
     * Flags a post as reported (soft-flag).
     */
    private void markPostAsReported(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(400, String.format(Messages.POST_NOT_FOUND, postId)));

        if (!post.isReported()) {
            post.setReported(true);
            postRepository.save(post);
        }
    }

    /**
     * Updates the user entity with the post ID that was reported.
     */
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