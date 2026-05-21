import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetPublicSettingsQuery } from '../store/api/settingsApi';
import { setPublicSettings } from '../store/slices/settingsSlice';
import { setAdminPrimaryOverride } from '../store/slices/themeSlice';

export function StoreBootstrap() {
  const dispatch = useDispatch();
  const { data } = useGetPublicSettingsQuery();

  useEffect(() => {
    if (!data) return;
    dispatch(setPublicSettings(data));
    dispatch(setAdminPrimaryOverride(data.primaryColor));
    document.title = data.storeName;
  }, [data, dispatch]);

  return null;
}
