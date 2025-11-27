import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
}

interface TenantState {
  tenants: Tenant[];
  currentTenantId: string | null;
  currentTenant: Tenant | null;
}

const initialState: TenantState = {
  tenants: [],
  currentTenantId: localStorage.getItem('tenantId'),
  currentTenant: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
    },
    setCurrentTenant: (state, action: PayloadAction<Tenant>) => {
      state.currentTenant = action.payload;
      state.currentTenantId = action.payload.id;
      localStorage.setItem('tenantId', action.payload.id);
    },
    clearTenant: (state) => {
      state.currentTenant = null;
      state.currentTenantId = null;
      localStorage.removeItem('tenantId');
    },
  },
});

export const { setTenants, setCurrentTenant, clearTenant } =
  tenantSlice.actions;
export default tenantSlice.reducer;

