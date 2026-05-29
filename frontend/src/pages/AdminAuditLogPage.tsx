import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useGetAdminAuditLogQuery } from '../store/api/catalogApi';

const ACTION_OPTIONS = [
  '',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_VISIBILITY_UPDATED',
  'PRODUCT_DELETED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
  'OFFER_CREATED',
  'OFFER_UPDATED',
  'OFFER_DELETED',
  'STORE_SETTINGS_UPDATED',
  'REVIEW_MODERATED',
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function toIsoOrUndefined(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function AdminAuditLogPage() {
  const [action, setAction] = useState('');
  const [fromLocal, setFromLocal] = useState('');
  const [toLocal, setToLocal] = useState('');
  const [filters, setFilters] = useState<{ action?: string; from?: string; to?: string }>({});

  const { data, isLoading, isFetching, isError } = useGetAdminAuditLogQuery({
    page: 0,
    size: 50,
    action: filters.action,
    from: filters.from,
    to: filters.to,
  });

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'When',
        width: 170,
        valueFormatter: (value: string) => formatDate(value),
      },
      { field: 'action', headerName: 'Action', width: 220 },
      { field: 'entityType', headerName: 'Entity', width: 120 },
      { field: 'entityId', headerName: 'Entity ID', flex: 1, minWidth: 140 },
      { field: 'actorUserId', headerName: 'Actor', width: 140 },
    ],
    [],
  );

  const applyFilters = () => {
    setFilters({
      action: action || undefined,
      from: toIsoOrUndefined(fromLocal),
      to: toIsoOrUndefined(toLocal),
    });
  };

  const clearFilters = () => {
    setAction('');
    setFromLocal('');
    setToLocal('');
    setFilters({});
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit log
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Track admin changes to products, offers, categories, and store settings.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-end',
          mb: 2,
        }}
      >
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="audit-action-label">Action</InputLabel>
          <Select
            labelId="audit-action-label"
            label="Action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <MenuItem value="">All actions</MenuItem>
            {ACTION_OPTIONS.filter(Boolean).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="From"
          type="datetime-local"
          size="small"
          value={fromLocal}
          onChange={(event) => setFromLocal(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="datetime-local"
          size="small"
          value={toLocal}
          onChange={(event) => setToLocal(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button variant="contained" onClick={applyFilters}>
          Apply
        </Button>
        <Button variant="outlined" onClick={clearFilters}>
          Clear
        </Button>
      </Box>

      {isError ? (
        <Typography color="error">Could not load audit log. Try again after signing in as admin.</Typography>
      ) : (
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={data?.content ?? []}
            columns={columns}
            loading={isLoading || isFetching}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: 'No audit entries match these filters.',
            }}
          />
        </Box>
      )}
    </Box>
  );
}
