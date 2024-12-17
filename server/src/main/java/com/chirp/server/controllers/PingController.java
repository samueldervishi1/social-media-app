package com.chirp.server.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@RestController
@RequestMapping("/api/v2/ping")
public class PingController {

	private static final String[] RESPONSES = {
			"bonk!" ,
			"chirp!" ,
			"You rang?" ,
			"Who’s there? It's me, your server!" ,
			"I’m alive, stop asking!" ,
			"Pong. Now go away, I'm busy." ,
			"Boom, you got me!" ,
			"Don't ping me, bro!"
	};

	@GetMapping
	public ResponseEntity<String> ping() {
		Random random = new Random();
		int index = random.nextInt(RESPONSES.length);
		return ResponseEntity.ok(RESPONSES[index]);
	}
}