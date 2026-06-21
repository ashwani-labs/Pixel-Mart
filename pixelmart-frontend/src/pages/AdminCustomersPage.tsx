import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { useGetAdminCustomersQuery } from '../store/api/orderApi';
import type { AdminCustomer } from '../types/order';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

export function AdminCustomersPage() {
  const { data, isLoading } = useGetAdminCustomersQuery();
  const customers = data?.content ?? [];

  const columns = useMemo<GridColDef<AdminCustomer>[]>(
    () => [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
      {
        field: 'enabled',
        headerName: 'Active',
        width: 90,
        type: 'boolean',
      },
      { field: 'loyaltyPoints', headerName: 'Points', width: 90, type: 'number' },
      {
        field: 'referralCode',
        headerName: 'Referral code',
        width: 130,
        valueGetter: (_value, row) => row.referralCode ?? '—',
      },
      { field: 'orderCount', headerName: 'Orders', width: 90, type: 'number' },
      {
        field: 'createdAt',
        headerName: 'Joined',
        width: 120,
        valueFormatter: (value: string) => (value ? formatDate(value) : '—'),
      },
    ],
    [],
  );

  return (
    <Box>
      <AdminPageHeader
        title="Customers"
        subtitle="Registered customers with loyalty points and order counts."
      />

      <Box sx={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          getRowId={(row) => row.id}
        />
      </Box>

      {!isLoading && customers.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No customers found.
        </Typography>
      )}
    </Box>
  );
}
