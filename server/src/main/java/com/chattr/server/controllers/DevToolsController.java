package com.chattr.server.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/dev")
public class DevToolsController {

    private final Random random = new Random();
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/horoscope/{sign}")
    public Map<String, Object> getRealHoroscope(@PathVariable String sign) {
        List<String> validSigns = Arrays.asList(validSignsProperty.split(","));
        if (!validSigns.contains(sign.toLowerCase().trim())) {
            return Map.of("error", "Invalid sign. Valid signs: " + validSigns);
        }

        String sanitizedSign = sign.toLowerCase().replaceAll("[^a-z]", "");

        if (!validSigns.contains(sanitizedSign)) {
            return Map.of("error", "Invalid sign after sanitization");
        }

        try {
            String url = UriComponentsBuilder
                    .fromUriString(horoscopeApiBaseUrl)
                    .path("/daily")
                    .queryParam("sign", sanitizedSign)
                    .queryParam("day", "today")
                    .encode()
                    .toUriString();

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    }
            );

            if (response.getBody() != null && response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                return Map.of(
                        "sign", sanitizedSign.toUpperCase(),
                        "horoscope", responseBody.getOrDefault("data", "Stars are aligned for you today"),
                        "date", LocalDate.now().toString()
                );
            }
        } catch (Exception e) {
            return Map.of("error", "Horoscope service unavailable");
        }

        return Map.of("error", "Could not fetch horoscope");
    }

    @GetMapping("/easter-egg")
    public Map<String, String> getEasterEgg() {
        return Map.of(
                "message", "You found the secret API!",
                "developer", "Built by Chattr Team",
                "coffee", "This API was built on " + getCoffeeCount() + " cups of coffee",
                "energy_drinks", "Powered by " + getEnergyDrinkCount() + " energy drinks",
                "total_caffeine", "Total caffeine consumed: " + getTotalCaffeineLevel() + "mg",
                "project_age", "Project running for " + getDaysSinceStart() + " days",
                "version", "v2.2.0"
        );
    }

    @GetMapping("/server-mood")
    public Map<String, Object> getServerMood() {
        List<String> moodsList = List.of(serverMoods.split(","));
        List<String> activitiesList = List.of(serverActivities.split(","));

        return Map.of(
                "mood", moodsList.get(random.nextInt(moodsList.size())),
                "current_activity", activitiesList.get(random.nextInt(activitiesList.size())),
                "uptime_human", serverUptimeMessage,
                "temperature", random.nextInt(40) + 20 + "°C",
                "energy_level", random.nextInt(100) + 1 + "%",
                "last_reboot", serverLastReboot
        );
    }

    @GetMapping("/should-i-deploy")
    public Map<String, String> shouldIDeploy() {
        List<String> answersList = List.of(deployAnswers.split(","));
        List<String> confidenceList = List.of(deployConfidenceLevels.split(","));
        List<String> actionsList = List.of(deployActions.split(","));

        return Map.of(
                "answer", answersList.get(random.nextInt(answersList.size())),
                "confidence", confidenceList.get(random.nextInt(confidenceList.size())),
                "recommended_action", actionsList.get(random.nextInt(actionsList.size())),
                "disclaimer", deployDisclaimer
        );
    }

    private int getCoffeeCount() {
        LocalDate projectStart = LocalDate.of(2025, 5, 8);
        long daysSinceStart = ChronoUnit.DAYS.between(projectStart, LocalDate.now());
        return (int)(daysSinceStart * 2);
    }

    private long getDaysSinceStart() {
        LocalDate projectStart = LocalDate.of(2025, 5, 8);
        return ChronoUnit.DAYS.between(projectStart, LocalDate.now());
    }

    private int getEnergyDrinkCount() {
        LocalDate projectStart = LocalDate.of(2025, 5, 8);
        long daysSinceStart = ChronoUnit.DAYS.between(projectStart, LocalDate.now());
        return (int)(daysSinceStart * 3.5);
    }

    private int getTotalCaffeineLevel() {
        return (getCoffeeCount() * 95) + (getEnergyDrinkCount() * 80);
    }

    @Value("${horoscope.api.base-url}")
    private String horoscopeApiBaseUrl;

    @Value("${horoscope.api.valid-signs}")
    private String validSignsProperty;

    @Value("${easter-egg.server.moods}")
    private String serverMoods;

    @Value("${easter-egg.server.activities}")
    private String serverActivities;

    @Value("${easter-egg.server.uptime-message}")
    private String serverUptimeMessage;

    @Value("${easter-egg.server.last-reboot}")
    private String serverLastReboot;

    @Value("${easter-egg.deploy.answers}")
    private String deployAnswers;

    @Value("${easter-egg.deploy.confidence-levels}")
    private String deployConfidenceLevels;

    @Value("${easter-egg.deploy.actions}")
    private String deployActions;

    @Value("${easter-egg.deploy.disclaimer}")
    private String deployDisclaimer;
}