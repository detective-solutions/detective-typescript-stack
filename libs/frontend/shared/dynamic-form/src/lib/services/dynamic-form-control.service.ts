import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { BaseFormField } from '../models';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DynamicFormControlService {
  formGroup!: UntypedFormGroup;
  formSubmit$ = new Subject<UntypedFormGroup>();
  selectionChanged$ = new Subject<{ key: string; value: string }>();

  get currentFormGroup(): UntypedFormGroup {
    if (this.formGroup) {
      return this.formGroup;
    }
    throw new Error('No dynamic form group available');
  }

  toFormGroup(inputFormFields: BaseFormField<string | boolean>[]): UntypedFormGroup {
    const group: any = {};

    inputFormFields.forEach((formField) => {
      group[formField.key] = formField.required
        ? new UntypedFormControl({ value: formField.value, disabled: formField.disabled }, Validators.required)
        : new UntypedFormControl(formField.value);
    });
    this.formGroup = new UntypedFormGroup(group);
    return this.formGroup;
  }

  get(key: string) {
    return this.formGroup.get(key);
  }

  submitForm() {
    this.formSubmit$.next(this.formGroup);
  }

  resetForm() {
    this.formGroup.reset();
  }
}
