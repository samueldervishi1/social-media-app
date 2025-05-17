package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Report;
import com.chattr.server.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for reporting posts or users.
 */
@RestController
@RequestMapping("/report")
public class ReportController {

	private final ReportService reportService;

	/**
	 * Constructor for injecting ReportService.
	 */
	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	/**
	 * Submit a new report for a post or user.
	 *
	 * @param report the report payload
	 * @return the saved report object
	 * @throws CustomException if saving fails
	 */
	@PostMapping
	public ResponseEntity<Report> reportPost(@RequestBody Report report) {
		try {
			Report savedReport = reportService.report(report);
			return ResponseEntity.ok(savedReport);
		} catch (Exception e) {
			throw new CustomException(500 , "Failed to create report");
		}
	}
}