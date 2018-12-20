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
      <input
      class="form-control field-box-name"
        [type]="config.type"
        [attr.placeholder]="config.placeholder"
        [formControlName]="config.name">
        
        <div *ngIf="group.get(config.name).errors && !group.get(config.name).pristine" class="error-msg">
          <div [hidden]="!group.get(config.name).errors.required">{{config.name}} is required.</div>
          <div [hidden]="!group.get(config.name).errors.patternInvalid">{{config.name}} is invalid.</div>
        </div>
        
        </div>
        </div>
        
        
        
        
        
        
        
        `
      })
      export class InputComponent implements Field {
        config: FieldConfig;
        group: FormGroup;
      }
      // <div class="" *ngIf="group.get(config.name).hasError(validation.name) && !group.get(config.name).pristine">{{validation.message}}</div>
      
      // <div *ngIf="group.get(config.name).invalid">
      //     <div class="error-message">
      //     {{validation.message}}
      //     </div>
      //   </div>