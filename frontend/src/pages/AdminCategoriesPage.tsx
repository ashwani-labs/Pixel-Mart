import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminCategoriesQuery,
  useUpdateCategoryMutation,
} from '../store/api/catalogApi';
import type { Category, UpsertCategoryRequest } from '../types/catalog';

const emptyForm: UpsertCategoryRequest = {
  name: '',
  slug: '',
  parentId: null,
  sortOrder: 0,
  active: true,
};

export function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useGetAdminCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [form, setForm] = useState<UpsertCategoryRequest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const columns: GridColDef<Category>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 160 },
    { field: 'sortOrder', headerName: 'Sort', width: 90 },
    { field: 'active', headerName: 'Active', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => startEdit(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      active: category.active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const body: UpsertCategoryRequest = {
      ...form,
      slug: form.slug?.trim() || undefined,
      parentId: form.parentId || null,
    };
    try {
      if (editingId) {
        await updateCategory({ id: editingId, body }).unwrap();
        setMessage('Category updated.');
      } else {
        await createCategory(body).unwrap();
        setMessage('Category created.');
      }
      resetForm();
    } catch {
      setMessage('Could not save category.');
    }
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    try {
      await deleteCategory(id).unwrap();
      if (editingId === id) {
        resetForm();
      }
      setMessage('Category deleted.');
    } catch {
      setMessage('Could not delete category.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Create, edit, and deactivate catalog categories.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'grid',
          gap: 2,
          maxWidth: 640,
          mb: 3,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6">{editingId ? 'Edit category' : 'New category'}</Typography>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
          required
        />
        <TextField
          label="Slug (optional)"
          value={form.slug ?? ''}
          onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
        />
        <TextField
          label="Sort order"
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))}
            />
          }
          label="Active on storefront"
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button type="submit" variant="contained" disabled={creating || updating}>
            {editingId ? 'Save changes' : 'Create category'}
          </Button>
          {editingId && (
            <Button type="button" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </Box>
        {message && (
          <Typography color="primary" variant="body2">
            {message}
          </Typography>
        )}
      </Box>

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={categories}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
}
