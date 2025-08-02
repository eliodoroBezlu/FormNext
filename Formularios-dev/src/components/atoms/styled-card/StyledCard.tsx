import { Card, CardProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

export default StyledCard;