package com.endo4life.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Slf4j
public class LoggingRequestInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(final HttpRequest request,
            final byte[] body,
            final ClientHttpRequestExecution execution) throws IOException {
        traceRequest(request, body);
        ClientHttpResponse response = execution.execute(request, body);
        traceResponse(response);
        return response;
    }

    private void traceRequest(HttpRequest request, byte[] body) {
        log.debug(
                """

                        [Request URI    : {}]
                        [Request method : {}]
                        [Request body   : {}]
                        """,
                request.getURI(),
                request.getMethod(),
                new String(body, StandardCharsets.UTF_8));
    }

    private void traceResponse(ClientHttpResponse response) throws IOException {
        var reader = new InputStreamReader(response.getBody(), StandardCharsets.UTF_8);
        var body = new BufferedReader(reader).lines().collect(Collectors.joining("\n"));
        log.debug(
                """

                        [Response status : {}]
                        [Response body   : {}]
                        """,
                response.getStatusCode(),
                body);
    }
}
