package com.server.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document("communityPost")
public class CommunityPost {

	@Id
	private String id;
	private String ownerId;
	private String communityName;
	private String content;
	private LocalDateTime createTime;
	private List<Comments> comments = new ArrayList<>();
	private boolean deleted;

	public CommunityPost() {
	}

	public CommunityPost(String ownerId , String communityName , String content , LocalDateTime createTime) {
		this.ownerId = ownerId;
		this.communityName = communityName;
		this.content = content;
		this.createTime = createTime;
		this.comments = new ArrayList<>();
		this.deleted = false;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(String ownerId) {
		this.ownerId = ownerId;
	}

	public String getCommunityName() {
		return communityName;
	}

	public void setCommunityName(String communityName) {
		this.communityName = communityName;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public LocalDateTime getCreateTime() {
		return createTime;
	}

	public void setCreateTime(LocalDateTime createTime) {
		this.createTime = createTime;
	}

	public List<Comments> getComments() {
		return comments;
	}

	public void setComments(List<Comments> comments) {
		this.comments = comments;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}
}