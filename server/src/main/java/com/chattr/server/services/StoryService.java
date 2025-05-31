package com.chattr.server.services;

import com.chattr.server.models.Story;
import com.chattr.server.repositories.StoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class StoryService {

	private final StoryRepository storyRepository;

	@Value("${story.upload-dir}")
	private String uploadDir;

	public StoryService(StoryRepository storyRepository) {
		this.storyRepository = storyRepository;
	}

	public void createStory(String userId , MultipartFile file , String caption , boolean isVideo) {
		try {
			String extension = getFileExtension(file.getOriginalFilename());
			String filename = UUID.randomUUID() + "." + extension;

			Path destination = Paths.get(uploadDir).toAbsolutePath().resolve(filename).normalize();
			Files.createDirectories(destination.getParent());

			file.transferTo(destination.toFile());

			Story story = new Story();
			story.setUserId(userId);
			story.setMediaPath(uploadDir + "/" + filename);
			story.setCaption(caption);
			story.setVideo(isVideo);
			story.setCreatedAt(LocalDateTime.now());
			story.setExpiresAt(LocalDateTime.now().plusHours(24));

			storyRepository.save(story);

		} catch (IOException e) {
			throw new RuntimeException("Failed to store story file" , e);
		}
	}

	public List<Story> getUserStories(String userId) {
		return storyRepository.findByUserIdAndExpiresAtAfter(userId , LocalDateTime.now());
	}

	public List<Story> getAllActiveStories() {
		return storyRepository.findByExpiresAtAfter(LocalDateTime.now());
	}

	public List<Story> getExpiredStories() {
		return storyRepository.findByExpiresAtBefore(LocalDateTime.now());
	}

	private String getFileExtension(String filename) {
		return Objects.requireNonNull(filename)
				.substring(filename.lastIndexOf('.') + 1)
				.toLowerCase();
	}
}