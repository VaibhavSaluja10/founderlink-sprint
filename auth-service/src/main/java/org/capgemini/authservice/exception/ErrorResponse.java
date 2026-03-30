package org.capgemini.authservice.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * Standard error response body returned for ALL exceptions.
 * Every error will have: status, error name, message, path, and timestamp.
 */
public class ErrorResponse {

    private int status;

    private String error;

    private String message;

    private String path;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    public ErrorResponse(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public int getStatus()             { return status; }
    public String getError()           { return error; }
    public String getMessage()         { return message; }
    public String getPath()            { return path; }
    public LocalDateTime getTimestamp(){ return timestamp; }
}
