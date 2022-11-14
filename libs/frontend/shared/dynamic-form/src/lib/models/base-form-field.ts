export class BaseFormField<T> {
  type: string;
  key: string;
  label: string;
  value: T | undefined;
  required: boolean;
  hint: string;
  options: { key: string; value: string }[];
  controlType: string;
  disabled: boolean;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      controlType?: string;
      type?: string;
      options?: { key: string; value: string }[];
      hint?: string;
      disabled?: boolean;
    } = {}
  ) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
    this.hint = options.hint || '';
    this.disabled = !!options.disabled;
  }
}
