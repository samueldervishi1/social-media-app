package com.chattr.server.services;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class GeoLocationService {

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
            return "Unknown Location";
        }
    }

    private String extract(String json, String key) {
        int start = json.indexOf(key);
        if (start == -1)
            return null;
        start += key.length();
        int end = json.indexOf("\"", start);
        return end != -1 ? json.substring(start, end) : null;
    }
}