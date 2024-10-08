package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document
public class History {

    @Id
    private String id;
    private String sessionId;
    private String userId;
    private LocalDate historyDate;
    private List<QuestionAnswerPair> questionAnswerPairs;

    public History(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.questionAnswerPairs = questionAnswerPairs;
        this.historyDate = LocalDate.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<QuestionAnswerPair> getQuestionAnswerPairs() {
        return questionAnswerPairs;
    }

    public void setQuestionAnswerPairs(List<QuestionAnswerPair> questionAnswerPairs) {
        this.questionAnswerPairs = questionAnswerPairs;
    }

    public LocalDate getHistoryDate() {
        return historyDate;
    }

    public void setHistoryDate(LocalDate historyDate) {
        this.historyDate = historyDate;
    }
}
