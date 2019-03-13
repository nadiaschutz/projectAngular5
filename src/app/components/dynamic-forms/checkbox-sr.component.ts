import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { NewServiceRequestComponent } from '../new-service-request/new-service-request.component';


@Component({
    selector: 'form-checkboxSr',
    template: `

  <div
  [formGroup]="group" [class]='config.elementClass'>

                <div class="form-check">
                    <input
                    class="form-check-input"
                    type="checkbox"
                    
                    (change)='callMe($event.target.value, config.name)'
                    [ngModel]="config.value"
                    [formControlName]="config.name"
                    >
                    <label class="form-check-label">
                    {{ config.label }}{{ config.name}}
                    </label>
                </div>
  `,
    styles: []
})
export class CheckboxSrComponent implements Field {
    config: FieldConfig;
    group: FormGroup;

    constructor(private comp: NewServiceRequestComponent) { }
    f(event) {
        this.group.get(this.config.name).patchValue(event);
    }

    public callMe(value, index): void {
        this.comp.checkEnableWhen(value, index);
    }
}
// <div class="demo-full-width margin-top" [formGroup]="group" >
// <mat-checkbox [formControlName]="field.name">{{field.label}}</mat-checkbox>
// </div>


// (change) = "f($event.target.checked)"
// (change) = "f($event.target.checked)"
