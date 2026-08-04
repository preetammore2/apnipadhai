import { baseApi } from './baseApi';
import { Course } from '@/types';
import { COURSES_DATA } from '@/data/courses';

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], string | void>({
      queryFn: (category) => {
        if (category && category !== 'all') {
          return { data: COURSES_DATA.filter((c) => c.category === category) };
        }
        return { data: COURSES_DATA };
      },
      providesTags: ['Course'],
    }),
    getCourseById: builder.query<Course | undefined, string>({
      queryFn: (id) => {
        return { data: COURSES_DATA.find((c) => c.id === id) };
      },
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
  }),
});

export const { useGetCoursesQuery, useGetCourseByIdQuery } = courseApi;
