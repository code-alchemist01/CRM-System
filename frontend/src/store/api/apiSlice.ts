import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    const tenantId = (getState() as RootState).tenant.currentTenantId;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    if (tenantId) {
      headers.set('x-tenant-id', tenantId);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User',
    'Tenant',
    'Customer',
    'Contact',
    'Opportunity',
    'Task',
    'Activity',
    'Document',
    'Email',
    'Invoice',
    'Report',
    'Dashboard',
  ],
  endpoints: () => ({}),
});

