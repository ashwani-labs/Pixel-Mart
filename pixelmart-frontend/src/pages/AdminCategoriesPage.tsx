import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
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
import { isSubCategory, isSuperCategory } from '../types/catalog';

type CategoryTab = 'super' | 'sub';

const emptySuperForm: UpsertCategoryRequest = {
  name: '',
  slug: '',
  parentId: null,
  sortOrder: 0,
  active: true,
};

const emptySubForm: UpsertCategoryRequest = {
  name: '',
  slug: '',
  parentId: '',
  sortOrder: 0,
  active: true,
};

export function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useGetAdminCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [tab, setTab] = useState<CategoryTab>('super');
  const [superForm, setSuperForm] = useState<UpsertCategoryRequest>(emptySuperForm);
  const [subForm, setSubForm] = useState<UpsertCategoryRequest>(emptySubForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const superCategories = useMemo(
    () => categories.filter(isSuperCategory).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const subCategories = useMemo(
    () => categories.filter(isSubCategory).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const superById = useMemo(
    () => new Map(superCategories.map((category) => [category.id, category])),
    [superCategories],
  );

  const superColumns: GridColDef<Category>[] = [
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
          <Button size="small" onClick={() => startEditSuper(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const subColumns: GridColDef<Category>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 140 },
    {
      field: 'parentId',
      headerName: 'Super category',
      flex: 1,
      minWidth: 160,
      valueGetter: (_value, row) => superById.get(row.parentId ?? '')?.name ?? '—',
    },
    { field: 'sortOrder', headerName: 'Sort', width: 90 },
    { field: 'active', headerName: 'Active', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => startEditSub(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const startEditSuper = (category: Category) => {
    setTab('super');
    setEditingId(category.id);
    setSuperForm({
      name: category.name,
      slug: category.slug,
      parentId: null,
      sortOrder: category.sortOrder,
      active: category.active,
    });
  };

  const startEditSub = (category: Category) => {
    setTab('sub');
    setEditingId(category.id);
    setSubForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? '',
      sortOrder: category.sortOrder,
      active: category.active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setSuperForm(emptySuperForm);
    setSubForm(emptySubForm);
  };

  const handleSuperSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const body: UpsertCategoryRequest = {
      ...superForm,
      slug: superForm.slug?.trim() || undefined,
      parentId: null,
    };
    try {
      if (editingId) {
        const editing = categories.find((c) => c.id === editingId);
        if (!editing || !isSuperCategory(editing)) {
          setMessage('Switch to the Categories tab to edit this item.');
          return;
        }
        await updateCategory({ id: editingId, body }).unwrap();
        setMessage('Super category updated.');
      } else {
        await createCategory(body).unwrap();
        setMessage('Super category created.');
      }
      resetForm();
    } catch {
      setMessage('Could not save super category.');
    }
  };

  const handleSubSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!subForm.parentId) {
      setMessage('Select a super category.');
      return;
    }
    const body: UpsertCategoryRequest = {
      ...subForm,
      slug: subForm.slug?.trim() || undefined,
      parentId: subForm.parentId,
    };
    try {
      if (editingId) {
        const editing = categories.find((c) => c.id === editingId);
        if (!editing || !isSubCategory(editing)) {
          setMessage('Switch to the Super categories tab to edit this item.');
          return;
        }
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
      setMessage('Deleted.');
    } catch {
      setMessage('Could not delete — remove sub-categories or products first.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Catalog hierarchy
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Super categories group your storefront aisles. Categories sit under a super category and hold products.
      </Typography>

      <Tabs value={tab} onChange={(_e, value: CategoryTab) => setTab(value)} sx={{ mb: 2 }}>
        <Tab value="super" label="Super categories" />
        <Tab value="sub" label="Categories" />
      </Tabs>

      {tab === 'super' && (
        <Box
          component="form"
          onSubmit={handleSuperSubmit}
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
          <Typography variant="h6">{editingId ? 'Edit super category' : 'New super category'}</Typography>
          <TextField
            label="Name"
            value={superForm.name}
            onChange={(e) => setSuperForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <TextField
            label="Slug (optional)"
            value={superForm.slug ?? ''}
            onChange={(e) => setSuperForm((current) => ({ ...current, slug: e.target.value }))}
          />
          <TextField
            label="Sort order"
            type="number"
            value={superForm.sortOrder}
            onChange={(e) =>
              setSuperForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={superForm.active}
                onChange={(e) => setSuperForm((current) => ({ ...current, active: e.target.checked }))}
              />
            }
            label="Active on storefront"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" disabled={creating || updating}>
              {editingId ? 'Save changes' : 'Create super category'}
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      )}

      {tab === 'sub' && (
        <Box
          component="form"
          onSubmit={handleSubSubmit}
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
          <FormControl required>
            <InputLabel id="super-category-label">Super category</InputLabel>
            <Select
              labelId="super-category-label"
              label="Super category"
              value={subForm.parentId ?? ''}
              onChange={(e) => setSubForm((current) => ({ ...current, parentId: e.target.value }))}
            >
              {superCategories.map((superCategory) => (
                <MenuItem key={superCategory.id} value={superCategory.id}>
                  {superCategory.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            value={subForm.name}
            onChange={(e) => setSubForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <TextField
            label="Slug (optional)"
            value={subForm.slug ?? ''}
            onChange={(e) => setSubForm((current) => ({ ...current, slug: e.target.value }))}
          />
          <TextField
            label="Sort order"
            type="number"
            value={subForm.sortOrder}
            onChange={(e) =>
              setSubForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={subForm.active}
                onChange={(e) => setSubForm((current) => ({ ...current, active: e.target.checked }))}
              />
            }
            label="Active on storefront"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={creating || updating || superCategories.length === 0}
            >
              {editingId ? 'Save changes' : 'Create category'}
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Box>
          {superCategories.length === 0 && (
            <Typography color="warning.main" variant="body2">
              Create a super category first.
            </Typography>
          )}
        </Box>
      )}

      {message && (
        <Typography color="primary" variant="body2" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      {tab === 'super' ? (
        <Box sx={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={superCategories}
            columns={superColumns}
            loading={isLoading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            getRowId={(row) => row.id}
          />
        </Box>
      ) : (
        <Box sx={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={subCategories}
            columns={subColumns}
            loading={isLoading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            getRowId={(row) => row.id}
          />
        </Box>
      )}
    </Box>
  );
}
