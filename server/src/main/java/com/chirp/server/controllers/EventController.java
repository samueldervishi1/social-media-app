package com.chirp.server.controllers;

import com.chirp.server.models.Event;
import com.chirp.server.services.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/events")
public class EventController {

	private final EventService eventService;

	private static final Logger logger = LoggerFactory.getLogger(EventController.class);

	public EventController(EventService eventService) {
		this.eventService = eventService;
	}

	@GetMapping("/all")
	public List<Event> getAllEvents() {
		logger.info("Received request to fetch all events");
		return eventService.getAllEvents();
	}

	@PostMapping("/create")
	public Event saveEvent(@RequestBody Event event) {
		logger.info("Received request to create a new event: {}" , event);
		try {
			return eventService.saveEvent(event);
		} catch (IllegalArgumentException e) {
			logger.error("Error creating event: {}" , e.getMessage());
			throw e;
		}
	}
}