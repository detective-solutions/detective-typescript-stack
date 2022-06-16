import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';

const modules = [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, FlexLayoutModule];

@NgModule({
  exports: modules,
})
export class DynamicFormMaterialModule {}
