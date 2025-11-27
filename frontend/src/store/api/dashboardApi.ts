import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
      refetchOnMountOrArgChange: true,
    }),
    getDetailedStats: builder.query<any, void>({
      query: () => '/dashboard/detailed',
      providesTags: ['Dashboard'],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const { useGetStatsQuery, useGetDetailedStatsQuery } = dashboardApi;

