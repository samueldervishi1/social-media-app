package com.server.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Document(collection = "health_logs")
public class HealthLog {

	@Id
	private String sessionId;
	private LocalDateTime timestamp;
	private List<HealthEntry> checks = new ArrayList<>();
	private LocalDate date;

	public HealthLog() {
		this.sessionId = UUID.randomUUID().toString();
		this.timestamp = LocalDateTime.now();
		this.date = LocalDate.now();
	}

	@Getter
	@Setter
	public static class HealthEntry {
		private String timestamp;
		private String status;
	}
}