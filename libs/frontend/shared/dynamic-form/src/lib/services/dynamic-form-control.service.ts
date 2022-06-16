import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BaseFormField } from '../models';
import { Injectable } from '@angular/core';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DynamicFormControlService {
  toFormGroup(inputFormFields: BaseFormField<string>[]) {
    const group: any = {};

    inputFormFields.forEach((formField) => {
      group[formField.key] = formField.required
        ? new FormControl(formField.value || '', Validators.required)
        : new FormControl(formField.value || '');
    });
    return new FormGroup(group);
  }
}
