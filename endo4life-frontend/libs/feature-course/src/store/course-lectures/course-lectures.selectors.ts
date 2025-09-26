import { RootState } from '..';

export const selectCourseLecturesIsLoading = (state: RootState) => {
  return state.lectures.loading;
};

export const selectCourseLectures = (state: RootState) => {
  const { lectures, lectureDetails } = state.lectures;
  return lectures?.map((item) => {
    if (item && lectureDetails.hasOwnProperty(item.id)) {
      const detail = lectureDetails[item.id];
      return {
        ...item,
        title: detail.title || item.title,
      };
    }
    return item;
  });
};

export const selectCourseLectureDetails = (state: RootState) => {
  const { lectureDetails } = state.lectures;
  return Object.keys(lectureDetails).map((key) => lectureDetails[key]);
};

export const selectCourseLecturesPagination = (state: RootState) => {
  return state.lectures.pagination;
};

export const selectCourseLectureById =
  (lectureId: string) => (state: RootState) => {
    return state.lectures.lectures?.find((item) => item.id === lectureId);
  };

export const selectCourseLectureDetailById =
  (lectureId: string) => (state: RootState) => {
    const { lectureDetails } = state.lectures;
    if (lectureDetails.hasOwnProperty(lectureId)) {
      return lectureDetails[lectureId];
    }
    return undefined;
  };

export const selectCourseLectureFormDataById =
  (lectureId: string) => (state: RootState) => {
    const lecture = selectCourseLectureById(lectureId)(state);
  };
