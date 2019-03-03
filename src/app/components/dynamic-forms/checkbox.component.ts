import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';


@Component({
  selector: 'form-checkbox',
  template: `

  <div
  [formGroup]="group" [class]='config.elementClass'>

                <div class="form-check">
                    <input
                    class="form-check-input"
                    [type]="config.type"
                    (change)="f($event.target.checked)"
                    [ngModel]="config.value"
                    [formControlName]="config.name"
                    >
                    <label class="form-check-label">
                    {{ config.label }}
                    </label>
                </div>
  `,
  styles: []
})
export class CheckboxComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  f(event) {
    this.group.get(this.config.name).patchValue(event);
  }
}
// <div class="demo-full-width margin-top" [formGroup]="group" >
// <mat-checkbox [formControlName]="field.name">{{field.label}}</mat-checkbox>
// </div>


// (change) = "f($event.target.checked)"
