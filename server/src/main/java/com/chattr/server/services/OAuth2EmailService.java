package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OAuth2EmailService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String USER_ID = "me";

    private final GeoLocationService geoLocationService;
    private final LoggingService loggingService;
    private Gmail gmailService;

    public OAuth2EmailService(GeoLocationService geoLocationService, LoggingService loggingService) {
        this.geoLocationService = geoLocationService;
        this.loggingService = loggingService;
    }

    public void sendSecurityAlert(String to, String ipAddress) {
        String sessionId = loggingService.getCurrentSessionId();

        try {
            loggingService.logInfo("OAuth2EmailService", "sendSecurityAlert",
                    String.format("Preparing to send security alert to %s for IP %s", to, ipAddress));

            String location = geoLocationService.geolocationFromIp(ipAddress);
            loggingService.logDebug("OAuth2EmailService", "sendSecurityAlert",
                    String.format("Resolved IP %s to location: %s", ipAddress, location));

            String htmlContent = formatSecurityAlertHtml(ipAddress, location);

            sendEmail(to, "New Login Detected", htmlContent);

            loggingService.logSecurityEvent("SECURITY_ALERT_SENT", to, sessionId,
                    String.format("Security alert email sent for login from IP %s (%s)", ipAddress, location));

            loggingService.logInfo("OAuth2EmailService", "sendSecurityAlert",
                    String.format("Security alert successfully sent to %s", to));

        } catch (Exception e) {
            loggingService.logSecurityEvent("SECURITY_ALERT_FAILED", to, sessionId,
                    String.format("Failed to send security alert for IP %s: %s", ipAddress, e.getMessage()));

            loggingService.logError("OAuth2EmailService", "sendSecurityAlert", "Failed to send security alert", e);
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        String sessionId = loggingService.getCurrentSessionId();

        try {
            loggingService.logInfo("OAuth2EmailService", "sendEmail",
                    String.format("Attempting to send email to %s with subject: %s", to, subject));

            Gmail service = getGmailService();
            loggingService.logDebug("OAuth2EmailService", "sendEmail", "Gmail service initialized successfully");

            MimeMessage email = createEmail(to, fromEmail, subject, htmlContent);
            Message message = createMessageWithEmail(email);

            service.users().messages().send(USER_ID, message).execute();

            loggingService.logInfo("OAuth2EmailService", "sendEmail",
                    String.format("Email successfully sent to %s", to));

        } catch (Exception e) {
            loggingService.logError("OAuth2EmailService", "sendEmail", String.format("Failed to send email to %s", to),
                    e);

            System.out.println("Error occurred while sending email: " + e.getMessage());
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    private Gmail getGmailService() throws IOException, GeneralSecurityException {
        if (gmailService == null) {
            loggingService.logDebug("OAuth2EmailService", "getGmailService",
                    "Initializing Gmail service for the first time");

            try {
                final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
                gmailService = new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                        .setApplicationName(applicationName).build();

                loggingService.logInfo("OAuth2EmailService", "getGmailService",
                        "Gmail service initialized successfully");

            } catch (IOException | GeneralSecurityException e) {
                loggingService.logError("OAuth2EmailService", "getGmailService", "Failed to initialize Gmail service",
                        e);
                throw e;
            }
        }
        return gmailService;
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT) throws IOException {
        try {
            loggingService.logDebug("OAuth2EmailService", "getCredentials", "Setting up OAuth2 credentials");

            GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
            details.setClientId(clientId);
            details.setClientSecret(clientSecret);
            details.setRedirectUris(List.of(redirectUri));

            GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
            clientSecrets.setInstalled(details);

            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY,
                    clientSecrets, Set.of(GmailScopes.GMAIL_SEND))
                    .setDataStoreFactory(new FileDataStoreFactory(new File(tokensDirectoryPath)))
                    .setAccessType("offline").build();

            LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8080).build();
            Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");

            loggingService.logInfo("OAuth2EmailService", "getCredentials", "OAuth2 credentials obtained successfully");

            return credential;

        } catch (IOException e) {
            loggingService.logError("OAuth2EmailService", "getCredentials", "Failed to obtain OAuth2 credentials", e);
            throw e;
        }
    }

    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws MessagingException {
        try {
            loggingService.logDebug("OAuth2EmailService", "createEmail",
                    String.format("Creating MIME message for %s", to));

            Properties props = new Properties();
            Session session = Session.getDefaultInstance(props, null);

            MimeMessage email = new MimeMessage(session);
            email.setFrom(new InternetAddress(from));
            email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
            email.setSubject(subject);
            email.setContent(bodyText, "text/html; charset=utf-8");

            loggingService.logDebug("OAuth2EmailService", "createEmail", "MIME message created successfully");
            return email;

        } catch (MessagingException e) {
            loggingService.logError("OAuth2EmailService", "createEmail", "Failed to create MIME message", e);
            throw e;
        }
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws MessagingException, IOException {
        try {
            loggingService.logDebug("OAuth2EmailService", "createMessageWithEmail",
                    "Converting MIME message to Gmail message format");

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            emailContent.writeTo(buffer);
            byte[] bytes = buffer.toByteArray();
            String encodedEmail = Base64.encodeBase64URLSafeString(bytes);

            Message message = new Message();
            message.setRaw(encodedEmail);

            loggingService.logDebug("OAuth2EmailService", "createMessageWithEmail",
                    String.format("Gmail message created, encoded size: %d bytes", encodedEmail.length()));

            return message;

        } catch (MessagingException | IOException e) {
            loggingService.logError("OAuth2EmailService", "createMessageWithEmail", "Failed to create Gmail message",
                    e);
            throw e;
        }
    }

    private String formatSecurityAlertHtml(String ipAddress, String location) {
        loggingService.logDebug("OAuth2EmailService", "formatSecurityAlertHtml",
                String.format("Formatting security alert HTML for IP %s, location %s", ipAddress, location));

        return """
                <!DOCTYPE html>
                <html lang='en'>
                <body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f8f9fa;'>
                    <div style='max-width:600px;margin:20px auto;background:#fff;border-radius:8px;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px;text-align:left;'>
                        <p>We noticed a login to your account from:</p>
                        <ul>
                            <li><strong>IP:</strong> %s</li>
                            <li><strong>Location:</strong> %s</li>
                        </ul>
                        <p>If it wasn't you, someone might be using your account.</p>
                        <div style='text-align:center;margin:20px 0;'>
                            <a href='http://localhost:5173/home' style='background:#1a73e8;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;'>Check activity</a>
                        </div>
                        <p style='font-size:11px;color:#999;text-align:center;'>© 2025 Chattr LLC, Tirana, Albania</p>
                    </div>
                </body>
                </html>
                """
                .formatted(ipAddress, location);
    }

    @Value("${google.oauth2.client-id}")
    private String clientId;

    @Value("${google.oauth2.client-secret}")
    private String clientSecret;

    @Value("${google.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${google.oauth2.tokens-directory}")
    private String tokensDirectoryPath;

    @Value("${google.oauth2.application-name}")
    private String applicationName;

    @Value("${mail.from}")
    private String fromEmail;
}
