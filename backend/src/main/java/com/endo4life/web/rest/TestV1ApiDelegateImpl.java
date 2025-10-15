package com.endo4life.web.rest;

import com.endo4life.service.test.TestService;
import com.endo4life.web.rest.api.TestV1ApiDelegate;
import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TestV1ApiDelegateImpl implements TestV1ApiDelegate {

    private final TestService testService;

    @Override
    public ResponseEntity<IdWrapperDto> createTest(CreateTestRequestDto createTestRequestDto) {
        UUID id = testService.createTest(createTestRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<Void> deleteTest(UUID id) {
        testService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<TestDetailResponseDto> getTestById(UUID id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }

    @Override
    public ResponseEntity<List<TestResponseDto>> getTests(UUID courseId) {
        return ResponseEntity.ok(testService.getTestsByCourseId(courseId));
    }

    @Override
    public ResponseEntity<Void> updateTest(UUID id, UpdateTestRequestDto updateTestRequestDto) {
        testService.updateTest(id, updateTestRequestDto);
        return ResponseEntity.noContent().build();
    }
}