package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Report;
import com.chirp.server.services.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/report")
public class ReportController {

	private final Logger logger = LoggerFactory.getLogger(ReportController.class);
	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@PostMapping
	public ResponseEntity<Report> reportPost(@RequestBody Report report) {
		try {
			logger.info("Report post request received for postId: {}, userId: {}" , report.getPostId() , report.getUserId());
			Report savedReport = reportService.report(report);
			return ResponseEntity.ok(savedReport);
		} catch (Exception e) {
			logger.error("Something went wrong during reporting: {}" , e.getMessage() , e);
			throw new CustomException("Failed to create report");
		}
	}
}