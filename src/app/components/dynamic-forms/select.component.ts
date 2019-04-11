import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { NewServiceRequestComponent } from "../new-service-request/new-service-request.component";
import { Router } from "@angular/router";

@Component({
  selector: 'form-input',
  template: `
  <div [class]='config.elementClass'>
      <div
        [formGroup]="group">
        <label class="label-name" *ngIf="config.required">{{ config.label }} (Required)</label>
        <label class="label-name" *ngIf="!config.required">{{ config.label }}</label>
        <select [formControlName]="config.name" class="form-control" (change)='callMe($event.target.value, config.name)'>
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
export class SelectComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  constructor(private comp: NewServiceRequestComponent, private router: Router) { }

  public callMe(value, index): void {
    if (this.router.url.indexOf('/newservicerequest') > -1 || this.router.url.indexOf('/newadvicerequest') > -1) {
      this.comp.checkEnableWhen(value, index);
    }
  }

}
