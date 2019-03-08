import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { NewServiceRequestComponent } from '../new-service-request/new-service-request.component';

@Component({
    selector: 'form-depend',
    template: `
  
    <div
    [formGroup]="group" [class]='config.elementClass'>
  
                  <div class="form-check">
                      <input
                      class="form-check-input"
                      type='checkbox'
                      (change)="f($event.target.checked)"
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
export class DependFormComponent implements Field {
    config: FieldConfig;
    group: FormGroup;

    constructor(private comp: NewServiceRequestComponent) { }

    public callMe(value, index): void {
        this.comp.checkEnableWhen(value, index);
    }
    //   if(config.elementClass === 'enable-when-hide') {

    // }
}