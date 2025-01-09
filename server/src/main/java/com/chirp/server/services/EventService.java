package com.chirp.server.services;

import com.chirp.server.models.Event;
import com.chirp.server.repositories.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

	private final EventRepository eventRepository;

	private static final Logger logger = LoggerFactory.getLogger(EventService.class);

	public EventService(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}

	public List<Event> getAllEvents() {
		logger.info("Fetching all events from the database");
		return eventRepository.findAll();
	}

	public Event saveEvent(Event event) {
		logger.info("Saving a new event: {}" , event);
		validateEvent(event);
		event.setDate(LocalDateTime.now());
		return eventRepository.save(event);
	}

	private void validateEvent(Event event) {
		if (isEmpty(event.getTitle())) {
			logger.error("Event title is empty");
			throw new IllegalArgumentException("Event title cannot be empty");
		}

		if (isEmpty(event.getDescription())) {
			logger.error("Event description is empty");
			throw new IllegalArgumentException("Event description cannot be empty");
		}

		if (event.getLat() == 0 || event.getLon() == 0) {
			logger.error("Event latitude or longitude is not set");
			throw new IllegalArgumentException("Event latitude and longitude must be set");
		}
	}

	private boolean isEmpty(String field) {
		return field == null || field.trim().isEmpty();
	}
}