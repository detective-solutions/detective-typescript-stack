import { DynamicFormComponent, DynamicFormFieldComponent } from './components';

import { CommonModule } from '@angular/common';
import { DynamicFormMaterialModule } from './dynamic-form.material.module';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, DynamicFormMaterialModule],
  declarations: [DynamicFormComponent, DynamicFormFieldComponent],
  exports: [DynamicFormComponent],
})
export class DynamicFormModule {}
