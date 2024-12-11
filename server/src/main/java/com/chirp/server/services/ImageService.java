package com.chirp.server.services;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Value("${aws.s3.bucketName}")
    private String bucketName;

    private final AmazonS3 amazonS3;

    public ImageService(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    public String uploadImage(String base64Image) {
        logger.info("Starting image upload");

        try {
            logger.info("Received Base64 image with length: {}" , base64Image.length());

            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            logger.info("Base64 image decoded into byte array, length: {}" , imageBytes.length);

            String key = "posts/" + System.currentTimeMillis() + ".jpg";
            logger.info("Generated S3 key for image: {}" , key);

            InputStream inputStream = new ByteArrayInputStream(imageBytes);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(imageBytes.length);
            metadata.setContentType("image/jpeg");

            logger.info("Uploading image to S3...");
            amazonS3.putObject(bucketName , key , inputStream , metadata);
            logger.info("Image uploaded successfully to S3 with URL: {}" , key);

            String imageUrl = amazonS3.getUrl(bucketName , key).toString();
            logger.info("Image URL generated: {}" , imageUrl);

            return imageUrl;

        } catch (IllegalArgumentException e) {
            logger.error("Invalid Base64 image provided: {}" , e.getMessage() , e);
            throw new RuntimeException("Invalid Base64 image provided" , e);

        } catch (Exception e) {
            logger.error("Error uploading image to S3: {}" , e.getMessage() , e);
            throw new RuntimeException("Error uploading image to S3" , e);
        }
    }
}