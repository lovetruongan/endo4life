import { IconType } from "react-icons";

export interface INavItem {
  id: string;
  label?: string;
  name?: string;
  link?: string;
  path?: string;
  icon?: IconType;
  disabled?: boolean;
  children?: INavItem[],
}