//package com.chirp.server.configs;
//
//import com.amazonaws.auth.AWSStaticCredentialsProvider;
//import com.amazonaws.auth.BasicAWSCredentials;
//import com.amazonaws.services.s3.AmazonS3;
//import com.amazonaws.services.s3.AmazonS3ClientBuilder;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class AwsConfig {
//
//    @Value("${aws.accessKeyId}")
//    private String accessKeyId;
//
//    @Value("${aws.secretKey}")
//    private String secretKey;
//
//    @Value("${aws.region}")
//    private String region;
//
//    @Bean
//    public AmazonS3 amazonS3() {
//        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKeyId, secretKey);
//        return AmazonS3ClientBuilder.standard()
//                .withRegion(region)
//                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
//                .build();
//    }
//}
