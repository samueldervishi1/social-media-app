//package com.chattr.server.services;
//
//import com.chattr.server.exceptions.CustomException;
//import com.chattr.server.models.Messages;
//import jakarta.mail.internet.MimeMessage;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.stereotype.Service;
//
///**
// * Service responsible for sending security alert emails to users.
// * It embeds IP and location info into a styled HTML message.
// */
//@Service
//public class EmailService {
//
//    @Value("${mail.from}")
//    private String from;
//
//    private final JavaMailSender javaMailSender;
//    private final GeoLocationService geoLocationService;
//
//    public EmailService(JavaMailSender javaMailSender, GeoLocationService geoLocationService) {
//        this.javaMailSender = javaMailSender;
//        this.geoLocationService = geoLocationService;
//    }
//
//    public void sendSecurityAlert(String to, String ipAddress) {
//        String location = geoLocationService.geolocationFromIp(ipAddress);
//
//        String htmlContent = formatHtmlContent(ipAddress, location);
//
//        try {
//            MimeMessage message = javaMailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
//
//            helper.setTo(to);
//            helper.setFrom(from);
//            helper.setSubject("New Login Detected");
//            helper.setText(htmlContent, true);
//
//            javaMailSender.send(message);
//        } catch (Exception e) {
//            System.out.println("Error occurred while sending email: " + e.getMessage());
//            throw new CustomException(500, Messages.ERROR_500);
//        }
//    }
//
//    private String formatHtmlContent(String ipAddress, String location) {
//        return """
//                <!DOCTYPE html>
//                <html lang='en'>
//                <body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f8f9fa;'>
//                    <div style='max-width:600px;margin:20px auto;background:#fff;border-radius:8px;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px;text-align:left;'>
//                        <p>We noticed a login to your account from:</p>
//                        <ul>
//                            <li><strong>IP:</strong> %s</li>
//                            <li><strong>Location:</strong> %s</li>
//                        </ul>
//                        <p>If it wasn't you, someone might be using your account.</p>
//                        <div style='text-align:center;margin:20px 0;'>
//                            <a href='https://your-app-url.com/security' style='background:#1a73e8;color:#fff;padding:12px 24px;border-radius:4px;'>Check activity</a>
//                        </div>
//                        <p style='font-size:11px;color:#999;text-align:center;'>© 2025 Chattr LLC, Tirana, Albania</p>
//                    </div>
//                </body>
//                </html>
//                """.formatted(ipAddress, location);
//    }
//}