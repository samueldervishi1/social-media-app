package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.Report;
import com.chirp.server.repositories.ReportPostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReportService {

	private final Logger logger = LoggerFactory.getLogger(ReportService.class);
	private final ReportPostRepository reportPostRepository;

	public ReportService(ReportPostRepository reportPostRepository) {
		this.reportPostRepository = reportPostRepository;
	}

	public Report report(Report report) {
		try {
			logger.info("Report user {} post {} reason {}" , report.getUserId() , report.getPostId() , report.getReason());

			boolean alreadyReported = reportPostRepository.existsByUserIdAndPostId(report.getUserId() , report.getPostId());
			if (alreadyReported) {
				logger.warn("User {} has already reported post {}. Duplicate report ignored." , report.getUserId() , report.getPostId());
				throw new BadRequestException("User " + report.getUserId() + " has already reported post " + report.getPostId());
			}

			report.setReportTime(LocalDateTime.now());
			logger.info("Report created for userId: {}, postId: {}" , report.getUserId() , report.getPostId());
			return reportPostRepository.save(report);
		} catch (Exception e) {
			logger.error("Error occurred while creating report: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("Failed to create report");
		}
	}
}