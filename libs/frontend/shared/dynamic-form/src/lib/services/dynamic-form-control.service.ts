import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BaseFormField } from '../models';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DynamicFormControlService {
  formGroup!: FormGroup;
  formSubmit$ = new Subject<FormGroup>();

  get currentFormGroup(): FormGroup {
    if (this.formGroup) {
      return this.formGroup;
    }
    throw new Error('No dynamic form group available');
  }

  toFormGroup(inputFormFields: BaseFormField<string>[]): FormGroup {
    const group: any = {};

    inputFormFields.forEach((formField) => {
      group[formField.key] = formField.required
        ? new FormControl(formField.value || '', Validators.required)
        : new FormControl(formField.value || '');
    });
    this.formGroup = new FormGroup(group);
    return this.formGroup;
  }

  submitForm() {
    this.formSubmit$.next(this.formGroup);
  }

  resetForm() {
    this.formGroup.reset();
  }
}
