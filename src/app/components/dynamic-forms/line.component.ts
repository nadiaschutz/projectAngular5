import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
  selector: 'form-line',
  template: `
      <div class="button-section-line line"></div>

  `
})
export class LineComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
