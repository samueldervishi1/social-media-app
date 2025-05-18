package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document
public class Hashtag {

	@Id
	private String id;
	private String name;
	private String link;
	private long views;

	public Hashtag(String id , String name , String link , long views) {
		this.id = id;
		this.name = name;
		this.link = link;
		this.views = views;
	}
}