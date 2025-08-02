import { Box, BoxProps } from '@mui/material';

const BulletPoint = (props: BoxProps) => (
  <Box
    sx={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: 'text.secondary',
      opacity: 0.4,
      mr: 1,
    }}
    {...props}
  />
);

export default BulletPoint;