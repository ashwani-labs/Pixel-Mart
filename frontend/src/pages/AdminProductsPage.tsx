import { useMemo, useState } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  useGetAdminProductsQuery,
  useUpdateProductVisibilityMutation,
} from '../store/api/catalogApi';
import { useUploadProductImageMutation } from '../store/api/settingsApi';
import uploadStyles from './AdminProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function AdminProductsPage() {
  const { data, isLoading } = useGetAdminProductsQuery({ page: 0, size: 200 });
  const [updateVisibility] = useUpdateProductVisibilityMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadProductImageMutation();
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: 'Product', flex: 1, minWidth: 180 },
      { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 160 },
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
    ],
    [updateVisibility],
  );

  const rows = data?.content ?? [];

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Toggle storefront visibility inline and upload product images by ID.
      </Typography>

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
            placeholder="Select a row ID from the grid"
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
        {message && <p className={uploadStyles.message}>{message}</p>}
      </form>
    </Box>
  );
}
