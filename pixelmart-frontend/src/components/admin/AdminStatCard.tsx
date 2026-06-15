import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  accent: string;
  loading?: boolean;
}

export function AdminStatCard({ label, value, hint, icon, accent, loading }: AdminStatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accent,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={44} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                {value}
              </Typography>
            )}
            {hint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {hint}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${accent}18`,
              color: accent,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
