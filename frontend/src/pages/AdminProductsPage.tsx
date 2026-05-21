import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUploadProductImageMutation } from '../store/api/settingsApi';
import styles from './PlaceholderPage.module.css';
import uploadStyles from './AdminProductsPage.module.css';

export function AdminProductsPage() {
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadImage, { isLoading }] = useUploadProductImageMutation();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className={styles.page}>
      <h1>Admin — Products</h1>
      <p>
        Full product DataGrid lands later. Use <code>GET /api/admin/products</code> to list IDs, then
        upload images below.
      </p>

      <form className={uploadStyles.uploadForm} onSubmit={handleUpload}>
        <label>
          Product ID
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="UUID from admin products API"
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading…' : 'Upload product image'}
        </button>
        {message && <p className={uploadStyles.message}>{message}</p>}
      </form>

      <Link to="/admin">← Admin home</Link>
    </div>
  );
}
