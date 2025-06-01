package com.chattr.server.services;

import com.chattr.server.models.Story;
import com.chattr.server.repositories.StoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class StoryService {

	private final StoryRepository storyRepository;

	@Value("${story.upload-dir}")
	private String uploadDir;

	@Value("${story.allowed-extensions}")
	private String allowedExtensionsConfig;

	public StoryService(StoryRepository storyRepository) {
		this.storyRepository = storyRepository;
	}

	public void createStory(String userId , MultipartFile[] files , String caption) {
		try {
			List<Story.MediaItem> mediaItems = new ArrayList<>();

			for (MultipartFile file : files) {
				String extension = getFileExtension(file.getOriginalFilename());
				String filename = UUID.randomUUID() + "." + extension;

				Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
				Path destination = uploadPath.resolve(filename).normalize();

				if (!destination.startsWith(uploadPath)) {
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
			throw new RuntimeException("Failed to store story files" , e);
		}
	}

	public List<Story> getUserStories(String userId) {
		return storyRepository.findByUserIdAndExpiresAtAfter(userId , LocalDateTime.now());
	}

	public List<Story> getAllActiveStories() {
		return storyRepository.findByExpiresAtAfter(LocalDateTime.now());
	}

	public Map<String, Integer> getStoryViewCount(String storyId) {
		Story story = storyRepository.findById(storyId)
				.orElseThrow(() -> new RuntimeException("Story not found"));

		int count = story.getViewedBy() != null ? story.getViewedBy().size() : 0;
		return Map.of("views-count" , count);
	}

	public void markStoryAsViewed(String storyId , String viewerId) {
		Story story = storyRepository.findById(storyId)
				.orElseThrow(() -> new RuntimeException("Story not found"));

		if (!story.getUserId().equals(viewerId) && !story.getViewedBy().contains(viewerId)) {
			story.getViewedBy().add(viewerId);
			storyRepository.save(story);
		}
	}

	private String getFileExtension(String filename) {
		if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
			throw new IllegalArgumentException("Invalid filename: potential path traversal");
		}
		int lastDot = filename.lastIndexOf('.');
		if (lastDot == -1 || lastDot == filename.length() - 1) {
			throw new IllegalArgumentException("Missing or invalid file extension");
		}
		String ext = filename.substring(lastDot + 1).toLowerCase();
		if (!getAllowedExtensions().contains(ext)) {
			throw new IllegalArgumentException("Unsupported file extension: " + ext);
		}
		return ext;
	}

	private boolean isVideoFile(String extension) {
		return List.of("mp4" , "mov" , "avi" , "webm" , "mkv").contains(extension.toLowerCase());
	}

	private List<String> getAllowedExtensions() {
		return Arrays.stream(allowedExtensionsConfig.split(","))
				.map(String::trim)
				.map(String::toLowerCase)
				.toList();
	}
}