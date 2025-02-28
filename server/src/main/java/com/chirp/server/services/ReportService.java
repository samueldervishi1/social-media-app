package com.chirp.server.services;

import com.chirp.server.models.Post;
import com.chirp.server.models.Report;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.ReportPostRepository;
import com.chirp.server.exceptions.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReportService {

	private static final Logger logger = LoggerFactory.getLogger(ReportService.class);
	private static final String USER_ALREADY_REPORTED = "User %s has already reported post %s";
	private static final String POST_NOT_FOUND = "Post with ID %s not found.";
	private static final String REPORT_ERROR = "Failed to create report";

	private final ReportPostRepository reportPostRepository;
	private final PostRepository postRepository;

	public ReportService(ReportPostRepository reportPostRepository , PostRepository postRepository) {
		this.reportPostRepository = reportPostRepository;
		this.postRepository = postRepository;
	}

	public Report report(Report report) {
		try {
			String userId = report.getUserId();
			String postId = report.getPostId();

			logger.info("Processing report - userId: {}, postId: {}, reason: {}" , userId , postId , report.getReason());

			validateAndHandleDuplicateReport(userId , postId);
			handlePostReporting(postId);

			report.setReportTime(LocalDateTime.now());
			Report savedReport = reportPostRepository.save(report);
			logger.info("Report successfully created - userId: {}, postId: {}" , userId , postId);

			return savedReport;
		} catch (Exception e) {
			logger.error("Error creating report: {}" , e.getMessage() , e);
			throw new CustomException(500 , REPORT_ERROR);
		}
	}

	private void validateAndHandleDuplicateReport(String userId , String postId) {
		if (reportPostRepository.existsByUserIdAndPostId(userId , postId)) {
			logger.warn("Duplicate report detected - userId: {}, postId: {}" , userId , postId);
			throw new CustomException(400 , String.format(USER_ALREADY_REPORTED , userId , postId));
		}
	}

	private void handlePostReporting(String postId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new CustomException(400 , String.format(POST_NOT_FOUND , postId)));

		if (!post.isReported()) {
			post.setReported(true);
			postRepository.save(post);
			logger.info("Post marked as reported - postId: {}" , postId);
		}
	}
}