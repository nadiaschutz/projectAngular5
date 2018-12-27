import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
  selector: 'form-phone',
  template: `

  <div
  [formGroup]="group">

  <label class="label-name">{{ config.label }}</label>
  <input
  class="form-control field-box-name"
  [type]="config.type"
  [attr.placeholder]="config.placeholder"
  [formControlName]="config.name">

        <div *ngIf="group.get(config.name).errors && !group.get(config.name).pristine" class="invalid-feedback">
          <div [hidden]="!group.get(config.name).errors.required">{{config.label | titlecase}} is required.</div>
          <div [hidden]="!group.get(config.name).errors.patternInvalid">{{config.label | titlecase}} is invalid.</div>
          <div [hidden]="!group.get(config.name).errors.minlength">{{config.label | titlecase}} must be at least 4 characters long.</div>
          <div [hidden]="!group.get(config.name).errors.maxlength"
          >{{config.label | titlecase}} must be not more than 10 characters long.</div>
        </div>

        </div>

        `
      })
      export class PhoneComponent implements Field {
        config: FieldConfig;
        group: FormGroup;
      }
