package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Setter
@Getter
public class QuestionAnswerPair {
    private List<Map<String, Object>> content;
    private String answer;

    public QuestionAnswerPair(List<Map<String, Object>> content, String answer) {
        this.content = content;
        this.answer = answer;
    }
}