import type {IconName} from "../../../atoms/Icon"
export interface IProps {
  title: string;
  icon: IconName;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}