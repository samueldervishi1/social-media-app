package com.chirp.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Document
public class SavePost {

	@Id
	private String id;
	private String userId;
	private List<String> postIds;

	public SavePost(String userId , List<String> postIds) {
		this.id = UUID.randomUUID().toString();
		this.userId = userId;
		this.postIds = postIds;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public List<String> getPostIds() {
		return postIds;
	}

	public void setPostIds(List<String> postIds) {
		this.postIds = postIds;
	}
}