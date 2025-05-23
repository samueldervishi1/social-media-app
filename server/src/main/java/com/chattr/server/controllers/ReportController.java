package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Report;
import com.chattr.server.services.ActivityLogService;
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
    private final ActivityLogService activityLogService;

    public ReportController(ReportService reportService, ActivityLogService activityLogService) {
        this.reportService = reportService;
        this.activityLogService = activityLogService;
    }

    @PostMapping
    public ResponseEntity<Report> reportPost(@RequestBody Report report) {
        try {
            Report savedReport = reportService.report(report);
            activityLogService.log(savedReport.getUserId(), "REPORT_CREATE", "Report created for post ID: " + savedReport.getPostId() + ".");
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            activityLogService.log(report.getUserId(), "REPORT_CREATE", "Failed to create report for post ID: " + report.getPostId() + ".");
            throw new CustomException(500, "Failed to create report");
        }
    }
}