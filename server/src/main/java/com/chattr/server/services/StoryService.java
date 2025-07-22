package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Story;
import com.chattr.server.repositories.StoryRepository;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final LoggingService loggingService;

    public StoryService(StoryRepository storyRepository, LoggingService loggingService) {
        this.storyRepository = storyRepository;
        this.loggingService = loggingService;
    }

    public void createStory(String userId, MultipartFile[] files, String caption) {
        String sessionId = loggingService.getCurrentSessionId();

        try {
            loggingService.logInfo("StoryService", "createStory",
                    String.format("User %s creating story with %d files", userId, files.length));

            long maxSize = getMaxFileSizeInBytes();
            List<Story.MediaItem> mediaItems = new ArrayList<>();

            Path userUploadPath = Paths.get(uploadDir, userId).toAbsolutePath().normalize();
            Files.createDirectories(userUploadPath);

            loggingService.logDebug("StoryService", "createStory",
                    String.format("Created/verified user directory: %s", userUploadPath));

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    throw new CustomException(400, "Uploaded file is empty.");
                }

                if (file.getSize() > maxSize) {
                    String sizeDetails = String.format("File size: %d bytes, Max allowed: %d bytes (%d MB)",
                            file.getSize(), maxSize, maxSize / (1024 * 1024));

                    loggingService.logWarn("StoryService", "createStory",
                            "File exceeds maximum allowed size: " + sizeDetails);

                    loggingService.logSecurityEvent("FILE_SIZE_VIOLATION", userId, sessionId,
                            String.format("User attempted to upload oversized file. %s", sizeDetails));

                    throw new CustomException(413,
                            "File exceeds the maximum allowed size of " + maxSize / (1024 * 1024) + "MB");
                }

                String extension = getFileExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + "." + extension;

                Path destination = userUploadPath.resolve(filename).normalize();

                if (!destination.startsWith(userUploadPath)) {
                    String securityDetails = String.format(
                            "Attempted path: %s, User directory: %s, Original filename: %s",
                            destination, userUploadPath, file.getOriginalFilename());

                    loggingService.logWarn("StoryService", "createStory",
                            "Path traversal attempt detected: " + securityDetails);

                    loggingService.logSecurityEvent("PATH_TRAVERSAL_ATTEMPT", userId, sessionId,
                            String.format("User attempted path traversal attack. %s", securityDetails));

                    throw new SecurityException("Invalid file path: outside user directory");
                }

                file.transferTo(destination.toFile());

                loggingService.logDebug("StoryService", "createStory",
                        String.format("File saved successfully: %s", destination));

                Story.MediaItem mediaItem = new Story.MediaItem();
                mediaItem.setPath(userId + "/" + filename);
                mediaItem.setVideo(isVideoFile(extension));

                mediaItems.add(mediaItem);
            }

            Story story = new Story();
            story.setUserId(userId);
            story.setCaption(caption);
            story.setMedia(mediaItems);
            story.setCreatedAt(LocalDateTime.now());
            story.setExpiresAt(LocalDateTime.now().plusHours(24));

            Story savedStory = storyRepository.save(story);

            loggingService.logInfo("StoryService", "createStory",
                    String.format("Story created successfully for user %s with %d media items. Story ID: %s",
                            userId, mediaItems.size(), savedStory.getId()));

        } catch (CustomException e) {
            loggingService.logWarn("StoryService", "createStory",
                    String.format("Story creation failed for user %s: %s", userId, e.getMessage()));
            throw e;
        } catch (IOException e) {
            loggingService.logError("StoryService", "createStory",
                    String.format("Failed to store story files for user %s", userId), e);

            loggingService.logSecurityEvent("STORY_UPLOAD_ERROR", userId, sessionId,
                    String.format("File upload error for user %s: %s", userId, e.getMessage()));

            throw new CustomException(500, "Internal Server error: " + e.getMessage());
        } catch (Exception e) {
            loggingService.logError("StoryService", "createStory",
                    String.format("Unexpected error creating story for user %s", userId), e);
            throw new CustomException(500, "Failed to create story");
        }
    }

    public List<Story> getUserStories(String userId) {
        return storyRepository.findByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }

    public List<Story> getAllActiveStories() {
        return storyRepository.findByExpiresAtAfter(LocalDateTime.now());
    }

    public Map<String, Integer> getStoryViewCount(String storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.STORY_NOT_FOUND)));

        int count = story.getViewedBy() != null ? story.getViewedBy().size() : 0;
        return Map.of("views-count", count);
    }

    public void markStoryAsViewed(String storyId, String viewerId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.STORY_NOT_FOUND)));

        if (!story.getUserId().equals(viewerId) && !story.getViewedBy().contains(viewerId)) {
            story.getViewedBy().add(viewerId);
            storyRepository.save(story);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new CustomException(400, Messages.INVALID_FILENAME);
        }

        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) {
            throw new CustomException(400, Messages.MISSING_FILE_EXTENSION);
        }

        String ext = filename.substring(lastDot + 1).toLowerCase();
        if (!getAllowedExtensions().contains(ext)) {
            throw new CustomException(400, Messages.UNSUPPORTED_FILE_EXTENSION);
        }

        return ext;
    }

    private long getMaxFileSizeInBytes() {
        String size = maxFileSizeConfig.trim().toUpperCase();
        if (size.endsWith("MB")) {
            return Long.parseLong(size.replace("MB", "").trim()) * 1024 * 1024;
        } else if (size.endsWith("KB")) {
            return Long.parseLong(size.replace("KB", "").trim()) * 1024;
        } else {
            return Long.parseLong(size);
        }
    }

    private boolean isVideoFile(String extension) {
        return List.of("mp4", "mov", "avi", "webm", "mkv").contains(extension.toLowerCase());
    }

    private List<String> getAllowedExtensions() {
        return Arrays.stream(allowedExtensionsConfig.split(",")).map(String::trim).map(String::toLowerCase).toList();
    }

    @Value("${story.upload-dir}")
    private String uploadDir;

    @Value("${story.allowed-extensions}")
    private String allowedExtensionsConfig;

    @Value("${story.max-file-size}")
    private String maxFileSizeConfig;
}
