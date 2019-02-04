import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
  selector: 'form-input',
  template: `
  <div [class]="config.class">
      <div 
        [formGroup]="group">
        <label class="label-name">{{ config.label }}</label>
        <select [formControlName]="config.name" class="form-control">
          <option value="">{{ config.placeholder }}</option>
          <option *ngFor="let option of config.options">
            {{ option }}
          </option>
        </select>
        <div *ngIf="group.get(config.name).errors && !group.get(config.name).pristine" class="invalid-feedback">
          <div [hidden]="!group.get(config.name).errors.required">{{config.label | titlecase}} is required.</div>
        </div>
      </div>
      </div>
            
  `
})
export class SelectComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;
  constructor() { }
  ngOnInit() { }
}
