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
        try {
            long maxSize = getMaxFileSizeInBytes();
            List<Story.MediaItem> mediaItems = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    throw new CustomException(400, "Uploaded file is empty.");
                }

                if (file.getSize() > maxSize) {
                    loggingService.logWarn("StoryService", "createStory",
                            "File exceeds the maximus allowed size of 6 MB");
                    throw new CustomException(413,
                            "File exceeds the maximum allowed size of " + maxSize / (1024 * 1024) + "MB");
                }

                String extension = getFileExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + "." + extension;

                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path destination = uploadPath.resolve(filename).normalize();

                if (!destination.startsWith(uploadPath)) {
                    loggingService.logWarn("StoryService", "createStory",
                            "Invalid file path: outside upload directory");
                    throw new SecurityException("Invalid file path: outside upload directory");
                }

                Files.createDirectories(destination.getParent());
                file.transferTo(destination.toFile());

                Story.MediaItem mediaItem = new Story.MediaItem();
                mediaItem.setPath(uploadDir + "/" + filename);
                mediaItem.setVideo(isVideoFile(extension));

                mediaItems.add(mediaItem);
            }

            Story story = new Story();
            story.setUserId(userId);
            story.setCaption(caption);
            story.setMedia(mediaItems);
            story.setCreatedAt(LocalDateTime.now());
            story.setExpiresAt(LocalDateTime.now().plusHours(24));
            storyRepository.save(story);

        } catch (IOException e) {
            loggingService.logError("StoryService", "createStory", "Failed to store story files", e);
            throw new CustomException(500, "Internal Server error: " + e.getMessage());
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
