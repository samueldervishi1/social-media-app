package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document
public class PredefineQuestions {

    @Id
    private String id;
    private String question;
    private String iconUrl;

    public PredefineQuestions(String question, String id, String iconUrl) {
        this.id = id;
        this.question = question;
        this.iconUrl = iconUrl;
    }
}