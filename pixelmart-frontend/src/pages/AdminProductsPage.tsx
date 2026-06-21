import { useMemo, useState } from 'react';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  useBulkStockUpdateMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAdminCategoriesQuery,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useUpdateProductVisibilityMutation,
} from '../store/api/catalogApi';
import { useUploadProductImageMutation } from '../store/api/settingsApi';
import type { BulkStockItem, Product, UpsertProductRequest } from '../types/catalog';
import { isSubCategory } from '../types/catalog';
import uploadStyles from './AdminProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

const emptyForm: UpsertProductRequest = {
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  basePrice: 0,
  compareAtPrice: null,
  stockQty: 0,
  visible: true,
  featured: false,
};

export function AdminProductsPage() {
  const { data, isLoading } = useGetAdminProductsQuery({ page: 0, size: 200 });
  const { data: categories = [] } = useGetAdminCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateVisibility] = useUpdateProductVisibilityMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadProductImageMutation();
  const [bulkStockUpdate, { isLoading: bulkUpdating }] = useBulkStockUpdateMutation();
  const [form, setForm] = useState<UpsertProductRequest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('');

  const assignableCategories = useMemo(
    () => categories.filter(isSubCategory).sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const columns = useMemo<GridColDef<Product>[]>(
    () => [
      { field: 'name', headerName: 'Product', flex: 1, minWidth: 180 },
      { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 140 },
      {
        field: 'categoryId',
        headerName: 'Category',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => categoryNameById.get(row.categoryId) ?? row.categoryId,
      },
      { field: 'stockQty', headerName: 'Stock', width: 90 },
      {
        field: 'basePrice',
        headerName: 'Price',
        width: 110,
        valueFormatter: (value: number) => formatPrice(value),
      },
      {
        field: 'visible',
        headerName: 'Visible',
        width: 100,
        sortable: false,
        renderCell: (params) => (
          <Switch
            checked={Boolean(params.value)}
            onChange={(event) =>
              updateVisibility({ id: String(params.row.id), visible: event.target.checked })
            }
            size="small"
          />
        ),
      },
      { field: 'featured', headerName: 'Featured', width: 100, type: 'boolean' },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 160,
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
    ],
    [categoryNameById, updateVisibility],
  );

  const rows = data?.content ?? [];

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setProductId(product.id);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      stockQty: product.stockQty,
      visible: product.visible,
      featured: product.featured,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!form.categoryId) {
      setMessage('Select a category.');
      return;
    }
    const body: UpsertProductRequest = {
      ...form,
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || null,
      compareAtPrice: form.compareAtPrice ?? null,
    };
    try {
      if (editingId) {
        await updateProduct({ id: editingId, body }).unwrap();
        setMessage('Product updated.');
      } else {
        const created = await createProduct(body).unwrap();
        setProductId(created.id);
        setMessage('Product created. You can upload an image below.');
      }
      if (editingId) {
        resetForm();
      }
    } catch {
      setMessage('Could not save product. Use a category under a super category.');
    }
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    try {
      await deleteProduct(id).unwrap();
      if (editingId === id) {
        resetForm();
        setProductId('');
      }
      setMessage('Product deleted.');
    } catch {
      setMessage('Could not delete product.');
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productId.trim() || !file) {
      setMessage('Enter a product ID and choose an image file.');
      return;
    }
    setMessage(null);
    try {
      const result = await uploadImage({ productId: productId.trim(), file }).unwrap();
      setMessage(`Uploaded — view at ${result.url}`);
      setFile(null);
    } catch {
      setMessage('Upload failed. Check product ID and admin login.');
    }
  };

  function parseBulkCsv(text: string): BulkStockItem[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const items: BulkStockItem[] = [];
    for (const line of lines) {
      const [productIdValue, stockValue] = line.split(/[,\t]/).map((part) => part.trim());
      if (!productIdValue || !stockValue) continue;
      const stockQty = Number(stockValue);
      if (!Number.isFinite(stockQty) || stockQty < 0) continue;
      items.push({ productId: productIdValue, stockQty });
    }
    return items;
  }

  const handleBulkStock = async () => {
    setMessage(null);
    const items = parseBulkCsv(bulkCsv);
    if (items.length === 0) {
      setMessage('Paste CSV rows as productId,stockQty');
      return;
    }
    try {
      await bulkStockUpdate({ items }).unwrap();
      setMessage(`Updated ${items.length} product(s).`);
      setBulkCsv('');
      setBulkDialogOpen(false);
    } catch {
      setMessage('Bulk stock update failed.');
    }
  };

  return (
    <Box>
      <AdminPageHeader
        title="Products"
        subtitle="Add products under a category (which belongs to a super category). Toggle visibility inline or upload images."
        actions={
          <Button variant="outlined" size="small" onClick={() => setBulkDialogOpen(true)}>
            Bulk stock update
          </Button>
        }
      />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'grid',
          gap: 2,
          maxWidth: 720,
          mb: 3,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6">{editingId ? 'Edit product' : 'New product'}</Typography>
        <FormControl required>
          <InputLabel id="product-category-label">Category</InputLabel>
          <Select
            labelId="product-category-label"
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((current) => ({ ...current, categoryId: e.target.value }))}
          >
            {assignableCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {assignableCategories.length === 0 && (
          <Typography color="warning.main" variant="body2">
            Create a super category and category first.
          </Typography>
        )}
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
          label="Description"
          value={form.description ?? ''}
          onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
          multiline
          minRows={2}
        />
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Base price (INR)"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            value={form.basePrice}
            onChange={(e) =>
              setForm((current) => ({ ...current, basePrice: Number(e.target.value) || 0 }))
            }
            required
          />
          <TextField
            label="Compare at price (optional)"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            value={form.compareAtPrice ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              setForm((current) => ({
                ...current,
                compareAtPrice: raw === '' ? null : Number(raw) || 0,
              }));
            }}
          />
        </Box>
        <TextField
          label="Stock quantity"
          type="number"
          slotProps={{ htmlInput: { min: 0, step: 1 } }}
          value={form.stockQty}
          onChange={(e) =>
            setForm((current) => ({ ...current, stockQty: Number(e.target.value) || 0 }))
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.visible}
              onChange={(e) => setForm((current) => ({ ...current, visible: e.target.checked }))}
            />
          }
          label="Visible on storefront"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.featured}
              onChange={(e) => setForm((current) => ({ ...current, featured: e.target.checked }))}
            />
          }
          label="Featured on home page"
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={creating || updating || assignableCategories.length === 0}
          >
            {editingId ? 'Save changes' : 'Create product'}
          </Button>
          {editingId && (
            <Button type="button" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      {message && (
        <Typography color="primary" variant="body2" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      <Box sx={{ height: 520, width: '100%', mb: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          getRowId={(row) => row.id}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Upload product image
      </Typography>
      <form className={uploadStyles.uploadForm} onSubmit={handleUpload}>
        <label>
          Product ID
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Select a row ID from the grid or create a product above"
          />
        </label>
        <label>
          Image file
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload product image'}
        </button>
      </form>

      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk stock update</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste one row per line: <code>productId,stockQty</code>
          </Typography>
          <TextField
            multiline
            minRows={8}
            fullWidth
            placeholder="abc-product-id,25&#10;def-product-id,10"
            value={bulkCsv}
            onChange={(e) => setBulkCsv(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={bulkUpdating} onClick={() => void handleBulkStock()}>
            {bulkUpdating ? 'Updating…' : 'Apply update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
