import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
  selector: 'form-button',
  template: `
    <div
      [formGroup]="group">
      <button
      class="btn regular-button"
        [disabled]="config.disabled"
        type="submit">
        {{ config.label }}
      </button>
    </div>
  `
})
export class ButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}