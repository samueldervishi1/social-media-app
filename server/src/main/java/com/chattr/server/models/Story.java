package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "stories")
public class Story {

	@Id
	private String id;
	private String mediaPath;
	private String caption;
	private boolean isVideo;
	private String userId;

	private LocalDateTime createdAt;
	private LocalDateTime expiresAt;
}