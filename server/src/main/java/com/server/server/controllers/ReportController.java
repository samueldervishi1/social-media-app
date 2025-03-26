package com.server.server.controllers;

import com.server.server.exceptions.CustomException;
import com.server.server.models.Report;
import com.server.server.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@PostMapping("/report")
	public ResponseEntity<Report> reportPost(@RequestBody Report report) {
		try {
			Report savedReport = reportService.report(report);
			return ResponseEntity.ok(savedReport);
		} catch (Exception e) {
			throw new CustomException("Failed to create report");
		}
	}
}