package com.chirp.server.services;

import com.chirp.server.models.Event;
import com.chirp.server.repositories.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class EventService {

	private static final Logger logger = LoggerFactory.getLogger(EventService.class);
	private static final String EMPTY_TITLE_ERROR = "Event title cannot be empty";
	private static final String EMPTY_DESCRIPTION_ERROR = "Event description cannot be empty";
	private static final String INVALID_COORDINATES_ERROR = "Event latitude and longitude must be set";

	private final EventRepository eventRepository;

	public EventService(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}

	public List<Event> getAllEvents() {
		logger.debug("Fetching all events");
		return eventRepository.findAll();
	}

	public Event saveEvent(Event event) {
		Objects.requireNonNull(event , "Event cannot be null");
		logger.debug("Saving new event with title: {}" , event.getTitle());

		validateEvent(event);
		event.setDate(LocalDateTime.now());

		Event savedEvent = eventRepository.save(event);
		logger.info("Successfully saved event with id: {}" , savedEvent.getId());
		return savedEvent;
	}

	private void validateEvent(Event event) {
		if (!StringUtils.hasText(event.getTitle())) {
			logger.error(EMPTY_TITLE_ERROR);
			throw new IllegalArgumentException(EMPTY_TITLE_ERROR);
		}

		if (!StringUtils.hasText(event.getDescription())) {
			logger.error(EMPTY_DESCRIPTION_ERROR);
			throw new IllegalArgumentException(EMPTY_DESCRIPTION_ERROR);
		}

		if (!isValidCoordinates(event.getLat() , event.getLon())) {
			logger.error(INVALID_COORDINATES_ERROR);
			throw new IllegalArgumentException(INVALID_COORDINATES_ERROR);
		}
	}

	private boolean isValidCoordinates(double lat , double lon) {
		return lat != 0 && lon != 0;
	}
}