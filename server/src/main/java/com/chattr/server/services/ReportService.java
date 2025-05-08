package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.Post;
import com.chattr.server.models.Report;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.ReportPostRepository;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

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

    public Report report(Report report) {
        try {
            String userId = report.getUserId();
            String postId = report.getPostId();
            validateAndHandleDuplicateReport(userId, postId);
            handlePostReporting(postId);

            report.setReportTime(LocalDateTime.now());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(404,Codes.USER_NOT_FOUND));

            if (user.getReportedPostIds() == null) {
                user.setReportedPostIds(new ArrayList<>());
            }

            if (!user.getReportedPostIds().contains(postId)) {
                user.getReportedPostIds().add(postId);
                userRepository.save(user);
            }

            return reportPostRepository.save(report);
        } catch (Exception e) {
            throw new CustomException(500, Codes.REPORT_ERROR);
        }
    }

    private void validateAndHandleDuplicateReport(String userId, String postId) {
        if (reportPostRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new CustomException(400, String.format(Codes.USER_ALREADY_REPORTED, userId, postId));
        }
    }

    private void handlePostReporting(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(400, String.format(Codes.POST_NOT_FOUND, postId)));

        if (!post.isReported()) {
            post.setReported(true);
            postRepository.save(post);
        }
    }
}