import React from 'react';
import { CardContent, List, ListItem, ListItemText } from '@mui/material';
import BulletPoint from '@/components/atoms/bullet-point/BulletPoint';


interface SettingCardContentProps {
  items: string[];
}

const SettingCardContent: React.FC<SettingCardContentProps> = ({ items }) => (
  <CardContent sx={{ pt: 0 }}>
    <List dense>
      {items.map((item, index) => (
        <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
          <BulletPoint />
          <ListItemText
            primary={item}
            primaryTypographyProps={{
              variant: 'body2',
              color: 'text.secondary',
            }}
          />
        </ListItem>
      ))}
    </List>
  </CardContent>
);

export default SettingCardContent;