package com.server.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(value = "reports")
public class Report {

	@Id
	private String id;
	private String userId;
	private String postId;
	private String reason;
	private LocalDateTime reportTime;

	public Report() {}


	public String getId() {
		return id;
	}

	public String getUserId() {
		return userId;
	}

	public String getPostId() {
		return postId;
	}

	public String getReason() {
		return reason;
	}

	public LocalDateTime getReportTime() {
		return reportTime;
	}

	public void setId(String id) {
		this.id = id;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public void setPostId(String postId) {
		this.postId = postId;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public void setReportTime(LocalDateTime reportTime) {
		this.reportTime = reportTime;
	}
}