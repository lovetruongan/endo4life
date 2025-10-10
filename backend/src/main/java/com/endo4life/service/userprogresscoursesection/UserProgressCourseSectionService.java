package com.endo4life.service.userprogresscoursesection;

import com.endo4life.web.rest.model.LectureAndTestDto;
import com.endo4life.web.rest.model.RecordDataUserCourseSectionDto;

import java.util.List;
import java.util.UUID;

public interface UserProgressCourseSectionService {
    UUID recordUserLectureData(UUID userProgressCourseSectionId,
            RecordDataUserCourseSectionDto recordDataUserCourseSectionDto);

    List<LectureAndTestDto> getUserLecturesAndTest(UUID courseId, UUID userInfoId);
}
