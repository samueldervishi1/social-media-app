package org.server.socialapp.controllers;

import org.server.socialapp.models.ContactForm;
import org.server.socialapp.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Value("${recipient.email}")
    private String recipientEmail;

    @PostMapping
    public ResponseEntity<String> sendContactEmail(@RequestBody ContactForm contactForm) {
        String to = recipientEmail;
        String from = contactForm.getEmail();
        String subject = "Contact Form Submission from " + contactForm.getName();
        String text ="\nMessage: " + contactForm.getMessage();

        emailService.sendEmail(to, from, subject, text);
        return ResponseEntity.ok("Email sent successfully!");
    }
}
