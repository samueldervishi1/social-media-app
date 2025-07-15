package com.chattr.server.models;

import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

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
