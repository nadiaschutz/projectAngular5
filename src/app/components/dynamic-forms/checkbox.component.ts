import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { NewServiceRequestComponent } from '../new-service-request/new-service-request.component';
import { Router } from '@angular/router';


@Component({
  selector: 'form-checkbox',
  template: `

  <div
  [formGroup]="group" [class]='config.elementClass'>

                <div class="form-check">
                    <input
                    class="form-check-input"
                    [type]="config.type"
                    (change) = "f($event.target.checked)"
                    (change)='callMe($event.target.value, config.name)'
                    [ngModel]="config.value"
                    [checked] = 'config.value'
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

  constructor(private comp: NewServiceRequestComponent, private router: Router) { }
  f(event) {
    this.group.get(this.config.name).patchValue(event);
  }

  public callMe(value, index): void {
    // console.log(this.router);
    if (this.router.url.indexOf('/newservicerequest') > -1 || this.router.url.indexOf('/newadvicerequest') > -1) {
      this.comp.checkEnableWhen(value, index);
    }
  }
}

