package com.server.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document
public class Post {

	@Id
	private String id;
	private String userId;
	private String content;
	private List<Comments> commentsList = new ArrayList<>();
	private String postDate;
	private String postTime;
	private Boolean deleted = false;
	private Boolean reported = false;

	public Post(String content) {
		this.id = UUID.randomUUID().toString();
		this.content = content;
		this.postDate = LocalDate.now().toString();
		this.postTime = LocalTime.now().toString();
	}

	public Post() {
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public List<Comments> getCommentsList() {
		return commentsList;
	}

	public void setCommentsList(List<Comments> commentsList) {
		this.commentsList = commentsList;
	}

	public String getPostDate() {
		return postDate;
	}

	public void setPostDate(String postDate) {
		this.postDate = postDate;
	}

	public void setPostTime(String postTime) {
		this.postTime = postTime;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public boolean isReported() {
		return reported;
	}

	public void setReported(boolean reported) {
		this.reported = reported;
	}

	public String getPostTime() {
		return postTime;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
}