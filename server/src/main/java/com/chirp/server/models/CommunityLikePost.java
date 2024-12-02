package com.chirp.server.models;

import java.time.LocalDateTime;
import java.util.List;

public class CommunityLikePost {
	private String userId;
	private List<String> postIds;
	private String communityName;
	private LocalDateTime createdAt;

	public CommunityLikePost() {
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

	public String getCommunityName() {
		return communityName;
	}

	public void setCommunityName(String communityName) {
		this.communityName = communityName;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}