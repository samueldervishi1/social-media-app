package com.chattr.server.models;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document
public class History {

  @Id private String id;
  private String sessionId;
  private String userId;
  private LocalDate historyDate;
  private List<QuestionAnswerPair> questionAnswerPairs;

  public History(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
    this.id = UUID.randomUUID().toString();
    this.sessionId = sessionId;
    this.userId = userId;
    this.questionAnswerPairs = questionAnswerPairs;
    this.historyDate = LocalDate.now();
  }
}
