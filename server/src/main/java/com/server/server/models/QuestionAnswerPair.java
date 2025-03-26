package com.server.server.models;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class QuestionAnswerPair {
	private String message;
	private String answer;

	public QuestionAnswerPair(String message , String answer) {
		this.message = message;
		this.answer = answer;
	}
}