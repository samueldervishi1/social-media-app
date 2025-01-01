package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.Post;
import com.chirp.server.models.Report;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.ReportPostRepository;
import com.chirp.server.models.ActivityModel.ActionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

	private final Logger logger = LoggerFactory.getLogger(ReportService.class);
	private final ReportPostRepository reportPostRepository;
	private final PostRepository postRepository;
	private final ActivityService activityService;

	public ReportService(ReportPostRepository reportPostRepository , PostRepository postRepository , ActivityService activityService) {
		this.reportPostRepository = reportPostRepository;
		this.postRepository = postRepository;
		this.activityService = activityService;
	}

	public Report report(Report report) {
		try {
			logger.info("Report user {} post {} reason {}" , report.getUserId() , report.getPostId() , report.getReason());

			boolean alreadyReported = reportPostRepository.existsByUserIdAndPostId(report.getUserId() , report.getPostId());
			if (alreadyReported) {
				logger.warn("User {} has already reported post {}. Duplicate report ignored." , report.getUserId() , report.getPostId());
				throw new BadRequestException("User " + report.getUserId() + " has already reported post " + report.getPostId());
			}

			Post post = postRepository.findById(report.getPostId()).orElseThrow(() -> new BadRequestException("Post with ID " + report.getPostId() + " not found."));
			if (!post.isReported()) {
				post.setReported(true);
				postRepository.save(post);
				logger.info("Post with ID {} reported successfully." , report.getPostId());
			} else {
				logger.warn("Post with ID {} already reported." , report.getPostId());
			}

			String actionTypeString = report.getUserId() + " reported post " + report.getPostId();
			ActionType actionType = new ActionType(List.of(actionTypeString));
			activityService.updateOrCreateActivity(report.getUserId() , actionType , "Post reported successfully");

			report.setReportTime(LocalDateTime.now());
			logger.info("Report created for userId: {}, postId: {}" , report.getUserId() , report.getPostId());
			return reportPostRepository.save(report);
		} catch (Exception e) {
			logger.error("Error occurred while creating report: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("Failed to create report");
		}
	}
}