import { request } from "./api";
import {
  mockCourse,
  mockMyCourses,
  mockProfile,
  type CourseDetail,
  type MemberCourse,
  type MemberProfile,
} from "./mocks";

export const getProfile = () =>
  request<MemberProfile>("/members/profile", {
    mock: mockProfile,
  });

export const getMyCourses = () =>
  request<MemberCourse[]>("/members/courses", {
    mock: mockMyCourses,
  });

export const getCourse = (id: string) =>
  request<CourseDetail>(`/members/courses/${id}`, {
    mock: () => mockCourse(id),
  });
