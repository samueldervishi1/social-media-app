package com.chattr.server.services;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Service to resolve geographic location based on IP using the ip-api.com public API.
 */
@Service
public class GeoLocationService {

    /**
     * Resolves the city and country of an IP address using an external public API.
     *
     * @param ip the IP address to resolve
     * @return a formatted location string or "Unknown location"
     */
    public String geolocationFromIp(String ip) {
        try {
            URL url = new URL("http://ip-api.com/json/" + ip);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = in.readLine()) != null) {
                response.append(line);
            }

            in.close();
            String json = response.toString();

            String city = extract(json, "\"city\":\"");
            String country = extract(json, "\"country\":\"");

            if (city == null && country == null) return "Unknown location";
            return (city != null ? city : "") + (city != null && country != null ? ", " : "") + (country != null ? country : "");

        } catch (Exception e) {
            return "Unknown location";
        }
    }

    /**
     * Extracts a field value from a JSON-like string.
     *
     * @param json the response body
     * @param key  the key prefix (e.g., "\"city\":\"")
     * @return the value if found, otherwise null
     */
    private String extract(String json, String key) {
        int start = json.indexOf(key);
        if (start == -1) return null;
        start += key.length();
        int end = json.indexOf("\"", start);
        return end != -1 ? json.substring(start, end) : null;
    }
}