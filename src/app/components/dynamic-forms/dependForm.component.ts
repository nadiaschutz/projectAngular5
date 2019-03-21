import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
export class DependFormComponent implements Field {
    config: FieldConfig;
    group: FormGroup;

    constructor(private comp: NewServiceRequestComponent) { }

    f(event) {
        this.group.get(this.config.name).patchValue(event);
    }
    //   if(config.elementClass === 'enable-when-hide') {

    // }


    // (change)="f($event.target.checked)"
}
