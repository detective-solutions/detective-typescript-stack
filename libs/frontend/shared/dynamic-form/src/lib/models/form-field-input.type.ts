export type FormFieldInput<T> = {
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  type: string;
  options: { key: string; value: string }[];
};
