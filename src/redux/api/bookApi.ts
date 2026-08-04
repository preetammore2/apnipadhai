import { baseApi } from './baseApi';
import { Book } from '@/types';
import { BOOKS_DATA } from '@/data/books';

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], void>({
      queryFn: () => {
        return { data: BOOKS_DATA };
      },
      providesTags: ['Book'],
    }),
    getBookById: builder.query<Book | undefined, string>({
      queryFn: (id) => {
        return { data: BOOKS_DATA.find((b) => b.id === id) };
      },
      providesTags: (result, error, id) => [{ type: 'Book', id }],
    }),
  }),
});

export const { useGetBooksQuery, useGetBookByIdQuery } = bookApi;
