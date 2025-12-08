package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.userprogresscoursesection.UserProgressCourseSectionService;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.LectureAndTestDto;
import com.endo4life.web.rest.model.RecordDataUserCourseSectionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@RoleAccess.Authenticated // All methods require authentication
public class UserCourseLecturesV1ApiDelegateImpl implements com.endo4life.web.rest.api.UserCourseLecturesV1ApiDelegate {
    private final UserProgressCourseSectionService userProgressCourseSectionService;

    @Override
    public ResponseEntity<List<LectureAndTestDto>> getUserCourseLectures(UUID courseId, UUID userInfoId) {
        List<LectureAndTestDto> list = userProgressCourseSectionService.getUserLecturesAndTest(courseId, userInfoId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @Override
    public ResponseEntity<IdWrapperDto> recordCourseSectionData(UUID id,
            RecordDataUserCourseSectionDto recordDataUserCourseSectionDto) {
        UUID userProgressCourseSectionId = userProgressCourseSectionService.recordUserLectureData(id,
                recordDataUserCourseSectionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(userProgressCourseSectionId));
    }
}
