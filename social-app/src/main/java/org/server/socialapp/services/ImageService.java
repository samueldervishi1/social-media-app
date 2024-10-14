package org.server.socialapp.services;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.server.socialapp.exceptions.InternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    public List<String> uploadImages(String bucketName, List<MultipartFile> files) {
        String credentialsPath = "/path-to-credentials.json";
        List<String> imageUrls = new ArrayList<>();

        try {
            Storage storage = StorageOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(new FileInputStream(credentialsPath)))
                    .build()
                    .getService();

            for (MultipartFile file : files) {
                try {
                    String objectName = file.getOriginalFilename();
                    BlobId blobId = BlobId.of(bucketName, objectName);
                    BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
                    storage.create(blobInfo, file.getBytes());

                    String imageUrl = "https://storage.googleapis.com/" + bucketName + "/" + objectName;
                    imageUrls.add(imageUrl);

                    logger.info("Image uploaded successfully to bucket {} as object {}", bucketName, objectName);
                } catch (IOException e) {
                    logger.error("Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage(), e);
                }
            }
        } catch (IOException e) {
            logger.error("Failed to initialize Google Cloud Storage: {}", e.getMessage(), e);
            throw new InternalServerErrorException("Failed to initialize Google Cloud Storage");
        }

        return imageUrls;
    }
}
