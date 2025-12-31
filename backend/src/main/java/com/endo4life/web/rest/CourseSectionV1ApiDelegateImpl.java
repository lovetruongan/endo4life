package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.coursesection.CourseSectionService;
import com.endo4life.web.rest.model.CourseSectionCriteria;
import com.endo4life.web.rest.model.CourseSectionResponseDto;
import com.endo4life.web.rest.model.CourseSectionResponsePaginatedDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.ResponseDetailCourseSectionDto;
import com.endo4life.web.rest.model.UpdateCourseSectionRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseSectionV1ApiDelegateImpl implements com.endo4life.web.rest.api.CourseSectionV1ApiDelegate {

    private final CourseSectionService courseSectionService;

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<CourseSectionResponsePaginatedDto> getCourseSections(CourseSectionCriteria criteria,
            Pageable pageable) {
        Page<CourseSectionResponseDto> pageCourseSectionResponseDto = courseSectionService.getCourseSections(criteria,
                pageable);
        return ResponseEntity.ok(
                new CourseSectionResponsePaginatedDto()
                        .data(pageCourseSectionResponseDto.getContent())
                        .total(pageCourseSectionResponseDto.getTotalElements()));
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<IdWrapperDto> createCourseSection(CreateCourseSectionRequestDto courseSectionRequestDto) {
        try {
            UUID id = courseSectionService.createCourseSection(courseSectionRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
        } catch (Exception e) {
            log.error("Error occurred while creating course section", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new IdWrapperDto());
        }
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<ResponseDetailCourseSectionDto> getCourseSectionById(UUID id) {
        return ResponseEntity.ok(
                courseSectionService.getCourseSectionById(id));
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<IdWrapperDto> updateCourseSection(UUID id, UpdateCourseSectionRequestDto metadata) {
        try {
            UUID courseSectionId = courseSectionService.updateCourseSection(id, metadata);
            return ResponseEntity.status(HttpStatus.OK).body(new IdWrapperDto().id(courseSectionId));
        } catch (Exception e) {
            log.error("Error occurred while update course section", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new IdWrapperDto().id(id));
        }
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<Void> deleteCourseSection(UUID id) {
        courseSectionService.deleteCourseSection(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    @RoleAccess.ContentManager // ADMIN or SPECIALIST
    public ResponseEntity<Void> deleteCourseSections(List<UUID> ids) {
        courseSectionService.deleteCourseSections(ids);
        return ResponseEntity.noContent().build();
    }
}
