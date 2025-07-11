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
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

@Service
public class OAuth2EmailService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String USER_ID = "me";

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

    private final GeoLocationService geoLocationService;
    private Gmail gmailService;

    public OAuth2EmailService(GeoLocationService geoLocationService) {
        this.geoLocationService = geoLocationService;
    }

    public void sendSecurityAlert(String to, String ipAddress) {
        try {
            String location = geoLocationService.geolocationFromIp(ipAddress);
            String htmlContent = formatSecurityAlertHtml(ipAddress, location);

            sendEmail(to, "New Login Detected", htmlContent);
        } catch (Exception e) {
            System.out.println("Error occurred while sending security alert email: " + e.getMessage());
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            Gmail service = getGmailService();
            MimeMessage email = createEmail(to, fromEmail, subject, htmlContent);
            Message message = createMessageWithEmail(email);
            service.users().messages().send(USER_ID, message).execute();
        } catch (Exception e) {
            System.out.println("Error occurred while sending email: " + e.getMessage());
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    private Gmail getGmailService() throws IOException, GeneralSecurityException {
        if (gmailService == null) {
            final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
            gmailService = new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                    .setApplicationName(applicationName)
                    .build();
        }
        return gmailService;
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT) throws IOException {
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        details.setRedirectUris(List.of(redirectUri));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, Set.of(GmailScopes.GMAIL_SEND))
                .setDataStoreFactory(new FileDataStoreFactory(new File(tokensDirectoryPath)))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8080).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setContent(bodyText, "text/html; charset=utf-8");

        return email;
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws MessagingException, IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.encodeBase64URLSafeString(bytes);

        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }

    private String formatSecurityAlertHtml(String ipAddress, String location) {
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
                """.formatted(ipAddress, location);
    }
}