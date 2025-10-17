export const ADMIN_WEB_ROUTES = {
    ROOT: '/',
    HOME: '/',
    USERS: '/users',
    USER_CREATE: '/users/create',
    USER_DETAIL: '/users/:id',
    USER_REGISTER: '/users/register',
    RESOURCES: '/resources',
    RESOURCE_CREATE: '/resources/create',
    RESOURCE_DETAIL: '/resources/:id',
    COMMENTS: '/comments',
    COMMENT_DETAIL: '/comments/:id',
  
    IMAGES: '/images',
    IMAGE_DETAIL: '/images/:id',
    IMAGE_CREATE: '/images/create',
    IMAGE_IMPORT: '/images/import',
  
    VIDEOS: '/videos',
    VIDEO_CREATE: '/videos/create',
    VIDEO_DETAIL: '/videos/:id',
    VIDEO_IMPORT: '/videos/import',
  
    COURSES: '/courses', // trang danh sách khoá học
    COURSE_CREATE: '/courses/create', // trang tạo khoá học
    COURSE_DETAIL: '/courses/:id', // trang xem thông tin của 1 khoá học
    COURSE_DETAIL_REQUIRED_TESTS: '/courses/:id/required-tests', // trang xem các bài kiểm tra đầu vào của 1 khoá học (test đầu vào + đầu ra)
    COURSE_DETAIL_REQUIRED_TESTS_DETAIL: '/courses/:id/required-tests/:testId', // trang xem chi tiết bài kiểm tra đầu vào của 1 khoá học (test đầu vào/ đầu ra)
    COURSE_DETAIL_REQUIRED_TESTS_SURVEY: '/courses/:id/required-tests/survey', // trang xem khảo sát của 1 khoá học
    COURSE_DETAIL_FINAL_TESTS: '/courses/:id/final-tests', // trang xem các bài kiểm tra cuối khoá của 1 khoá học (test đầu vào + đầu ra)
    COURSE_DETAIL_FINAL_TESTS_DETAIL: '/courses/:id/final-tests/:testId', // trang xem chi tiết bài kiểm tra cuối khoá của 1 khoá học (test đầu vào/ đầu ra)
    COURSE_DETAIL_LECTURES: '/courses/:id/lectures', // trang xem các bài giảng của 1 khoá học
    COURSE_DETAIL_LECTURES_DETAIL: '/courses/:id/lectures/:lectureId', // trang xem 1 bài giảng của 1 khoá học (redirect tới COURSE_DETAIL_LECTURES_CONTENT)
    COURSE_DETAIL_LECTURES_CONTENT: '/courses/:id/lectures/:lectureId/contents', // trang xem các nội dung của 1 bài giảng của 1 khoá học
    COURSE_DETAIL_LECTURES_CONTENT_DETAIL:
      '/courses/:id/lectures/:lectureId/contents/:contentId', // trang xem 1 nội dung của 1 bài giảng của 1 khoá học
    COURSE_DETAIL_LECTURES_RECAP_QUESTION:
      '/courses/:id/lectures/:lectureId/recap-question', // trang xem các câu hỏi ôn tập của 1 bài giảng của 1 khoá học
  
    QUESTIONS: '/questions',
    DOCUMENTS: '/documents',
  };
  