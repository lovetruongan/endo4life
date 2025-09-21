package com.endo4life.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Problem;
import org.zalando.problem.Status;

import java.text.MessageFormat;

public class BadRequestException extends AbstractThrowableProblem {

    public BadRequestException(final String message, final Object... args) {
        super(Problem.DEFAULT_TYPE, MessageFormat.format(message, args), Status.BAD_REQUEST);
    }
}
