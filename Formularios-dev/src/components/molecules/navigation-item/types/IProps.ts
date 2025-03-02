export interface IProps {
  title: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}