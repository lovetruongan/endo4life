export interface IOption<T = any> {
  label: string;
  value: string;
  hidden?: boolean;
  selected?: boolean;
  disabled?: boolean;
  metadata?: T;
  children?: IOption<T>[];
}
