import { baseApi } from './baseApi';
import { Book } from '@/types';

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], void>({
      async queryFn() {
        try {
          const res = await fetch('/api/books');
          if (!res.ok) throw new Error('Failed to fetch books');
          const data = (await res.json()) as Book[];
          return { data };
        } catch (error) {
          return {
            error: { status: 'FETCH_ERROR', error: String(error) },
          };
        }
      },
      providesTags: ['Book'],
    }),
    getBookById: builder.query<Book | undefined, string>({
      async queryFn(id) {
        try {
          const res = await fetch(`/api/books/${encodeURIComponent(id)}`);
          if (res.status === 404) return { data: undefined };
          if (!res.ok) throw new Error('Failed to fetch book');
          const data = (await res.json()) as Book;
          return { data };
        } catch (error) {
          return {
            error: { status: 'FETCH_ERROR', error: String(error) },
          };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Book', id }],
    }),
  }),
});

export const { useGetBooksQuery, useGetBookByIdQuery } = bookApi;
