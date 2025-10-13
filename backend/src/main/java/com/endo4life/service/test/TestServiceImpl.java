package com.endo4life.service.test;

import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.Test;
import com.endo4life.mapper.TestMapper;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.TestRepository;
import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final CourseRepository courseRepository;
    private final TestMapper testMapper;

    @Override
    public List<TestResponseDto> getTestsByCourseId(UUID courseId) {
        return testRepository.findByCourseId(courseId).stream()
                .map(testMapper::toTestResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public UUID createTest(CreateTestRequestDto createTestRequestDto) {
        Course course = courseRepository.findById(createTestRequestDto.getCourseId())
                .orElseThrow(
                        () -> new NotFoundException("Course not found with id: " + createTestRequestDto.getCourseId()));

        Test test = testMapper.toTest(createTestRequestDto);
        test.setCourse(course);

        testRepository.save(test);
        return test.getId();
    }

    @Override
    public TestDetailResponseDto getTestById(UUID id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + id));
        return testMapper.toTestDetailResponseDto(test);
    }

    @Override
    public void updateTest(UUID id, UpdateTestRequestDto updateTestRequestDto) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + id));

        testMapper.updateTestFromDto(test, updateTestRequestDto);
        testRepository.save(test);
    }

    @Override
    public void deleteTest(UUID id) {
        if (!testRepository.existsById(id)) {
            throw new NotFoundException("Test not found with id: " + id);
        }
        testRepository.deleteById(id);
    }
}