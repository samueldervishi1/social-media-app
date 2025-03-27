package com.server.server.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;

@Setter
@Schema(description = "Used when an API requests user information such as user ID and username")
@Validated
@jakarta.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2025-01-27T15:47:35.144Z")


public class UserInfo {
	@Getter
	@JsonProperty("username")
	private String username = null;

	@Getter
	@JsonProperty("userId")
	private String userId = null;

	@JsonProperty("status")
	private String status = null;

	@Getter
	@JsonProperty("message")
	private String message = null;
}