package com.endo4life.web.rest.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class FileUploadFailedException extends RuntimeException {

    public FileUploadFailedException(String message) {
        super(message);
    }

    public FileUploadFailedException(String messageTemplate, Object... args) {
        super(String.format(messageTemplate.replace("{0}", "%s"), args));
    }

    public FileUploadFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
