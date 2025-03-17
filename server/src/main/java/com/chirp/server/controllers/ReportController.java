package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Report;
import com.chirp.server.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hyper-api/auranet/v2.1.5/insight-hub")
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@PostMapping
	public ResponseEntity<Report> reportPost(@RequestBody Report report) {
		try {
			Report savedReport = reportService.report(report);
			return ResponseEntity.ok(savedReport);
		} catch (Exception e) {
			throw new CustomException("Failed to create report");
		}
	}
}