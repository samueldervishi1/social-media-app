package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${mail.from}")
    private String from;

    private final JavaMailSender javaMailSender;
    private final GeoLocationService geoLocationService;

    public EmailService(JavaMailSender javaMailSender, GeoLocationService geoLocationService) {
        this.javaMailSender = javaMailSender;
        this.geoLocationService = geoLocationService;
    }

    public void sendSecurityAlert(String to, String ipAddress) {
        String location = geoLocationService.geolocationFromIp(ipAddress);

        String htmlContent = """
                <!DOCTYPE html>
                <html lang='en'>
                  <body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f8f9fa;'>
                    <div style='max-width:600px;margin:20px auto;background:#fff;border-radius:8px;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px;text-align:left;'>
                      <p style='font-size:15px;margin:10px 0;'>We noticed a login to your account from:</p>
                      <ul style='font-size:15px;color:#333;margin-left:20px;'>
                        <li><strong>IP:</strong> %s</li>
                        <li><strong>Location:</strong> %s</li>
                      </ul>
                      <p style='font-size:15px;color:#333;'>If it wasn't you, someone might be using your account. Check and secure your account now.</p>
                      <div style='text-align:center;margin:20px 0;'>
                        <a href='https://your-app-url.com/security' style='background:#1a73e8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:16px;'>Check activity</a>
                      </div>
                      <p style='font-size:13px;color:#777;text-align:center;'>You can also see security activity at<br/><a href='https://your-app-url.com/notifications'>https://your-app-url.com/notifications</a></p>
                      <hr style='border:none;border-top:1px solid #eee;margin:30px 0;' />
                      <p style='font-size:11px;color:#999;text-align:center;'>You received this email to let you know about important changes to your Chattr account and services.<br/>© 2025 Chattr LLC, Tirana, Albania</p>
                    </div>
                  </body>
                </html>
                """.formatted(ipAddress, location);
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject("New Login Detected");
            helper.setText(htmlContent, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            System.out.println("Error happened" + e.getMessage());
            throw new CustomException(500, Codes.ERROR_500);
        }
    }
}