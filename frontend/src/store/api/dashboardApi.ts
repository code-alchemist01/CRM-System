import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getDetailedStats: builder.query<any, void>({
      query: () => '/dashboard/detailed',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetStatsQuery, useGetDetailedStatsQuery } = dashboardApi;

