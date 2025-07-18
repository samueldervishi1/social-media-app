package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Report;
import com.chattr.server.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for reporting posts or users. */
@RestController
@RequestMapping("/report")
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
            throw new CustomException(500, "Failed to create report");
        }
    }
}
