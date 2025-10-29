package com.endo4life.service.test;

import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import java.util.List;
import java.util.UUID;

public interface TestService {
    List<TestResponseDto> getTestsByCourseId(UUID courseId);

    TestDetailResponseDto getTestByCourseIdAndType(UUID courseId, String type);

    UUID createTest(CreateTestRequestDto createTestRequestDto);

    TestDetailResponseDto getTestById(UUID id);

    void updateTest(UUID id, UpdateTestRequestDto updateTestRequestDto);

    void deleteTest(UUID id);
}