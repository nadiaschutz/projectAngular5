import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
  selector: 'form-header',
  template: `
  <h6>{{ config.label }}</h6>

  `
})
export class HeaderComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
