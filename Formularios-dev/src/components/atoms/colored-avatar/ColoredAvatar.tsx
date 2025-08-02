import { Avatar, AvatarProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ColoredAvatarProps extends AvatarProps {
  bgcolor: string;
}

const ColoredAvatar = styled(Avatar)<ColoredAvatarProps>(({ bgcolor }) => ({
  backgroundColor: bgcolor,
  width: 48,
  height: 48,
  marginBottom: 16,
}));

export default ColoredAvatar;