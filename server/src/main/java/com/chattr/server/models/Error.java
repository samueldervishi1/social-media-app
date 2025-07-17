package com.chattr.server.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.util.Objects;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;

@Setter
@Schema(description = "Used when an API throws an Error, typically with a HTTP error response-code (3xx, 4xx, 5xx)")
@Validated
@jakarta.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2025-01-27T15:47:35.144Z")
public class Error {
    @JsonProperty("code")
    private String code = null;

    @JsonProperty("reason")
    private String reason = null;

    @JsonProperty("message")
    private String message = null;

    @JsonProperty("status")
    private String status = null;

    @JsonProperty("referenceError")
    private String referenceError = null;

    @JsonProperty("@baseType")
    private String baseType = null;

    @JsonProperty("@schemaLocation")
    private String schemaLocation = null;

    @JsonProperty("@type")
    private String type = null;

    public Error code(String code) {
        this.code = code;
        return this;
    }

    @Schema(description = "Application relevant detail, defined in the API or a common list.")
    @NotNull
    public Error reason(String reason) {
        this.reason = reason;
        return this;
    }

    @Schema(description = "Explanation of the reason for the error which can be shown to a client user.")
    @NotNull
    public Error message(String message) {
        this.message = message;
        return this;
    }

    @Schema(description = "More details and corrective actions related to the error which can be shown to a client user.")
    public String getMessage() {
        return message;
    }

    public Error status(String status) {
        this.status = status;
        return this;
    }

    @Schema(description = "HTTP Error code extension")
    public String getStatus() {
        return status;
    }

    public Error referenceError(String referenceError) {
        this.referenceError = referenceError;
        return this;
    }

    @Schema(description = "URI of documentation describing the error.")
    public Error baseType(String baseType) {
        this.baseType = baseType;
        return this;
    }

    @Schema(description = "When sub-classing, this defines the super-class.")
    public Error schemaLocation(String schemaLocation) {
        this.schemaLocation = schemaLocation;
        return this;
    }

    @Schema(description = "A URI to a JSON-Schema file that defines additional attributes and relationships")
    public Error type(String type) {
        this.type = type;
        return this;
    }

    @Schema(description = "When sub-classing, this defines the sub-class entity name.")
    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Error error = (Error) o;
        return Objects.equals(this.code, error.code) && Objects.equals(this.reason, error.reason)
                && Objects.equals(this.message, error.message) && Objects.equals(this.status, error.status)
                && Objects.equals(this.referenceError, error.referenceError)
                && Objects.equals(this.baseType, error.baseType)
                && Objects.equals(this.schemaLocation, error.schemaLocation) && Objects.equals(this.type, error.type);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, reason, message, status, referenceError, baseType, schemaLocation, type);
    }

    @Override
    public String toString() {

        return "class Error {\n" + "    code: " + toIndentedString(code) + "\n" + "    reason: "
                + toIndentedString(reason) + "\n" + "    message: " + toIndentedString(message) + "\n" + "    status: "
                + toIndentedString(status) + "\n" + "    referenceError: " + toIndentedString(referenceError) + "\n"
                + "    baseType: " + toIndentedString(baseType) + "\n" + "    schemaLocation: "
                + toIndentedString(schemaLocation) + "\n" + "    type: " + toIndentedString(type) + "\n" + "}";
    }

    private String toIndentedString(java.lang.Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
