import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';

@Component({
    selector: 'form-comment',
    template: `
 
  <div
  [formGroup]="group" [class]='config.elementClass'>

  <label class="label-name">{{ config.label }}{{ config.name }}</label>
  <textarea
  class="form-control field-box-name"
  [attr.placeholder]="config.placeholder"
  rows="4" cols="50"
  [formControlName]="config.name">
  </textarea>
  
  
        <div *ngIf="group.get(config.name).errors && (group.get(config.name).touched && group.get(config.name).dirty)" class="invalid-feedback">
            <div ng-show="group.get(config.name).$error.pattern">{{config.label | titlecase}} is not valid</div>
        </div>

        <div  *ngIf="group.get(config.name).touched && group.get(config.name).hasError('required')">
          <div>{{config.label | titlecase}}  is required</div>
        </div>

        
        </div>
        
        `
})
export class CommentComponent implements Field {
    config: FieldConfig;
    group: FormGroup;
}

      // <div  [hidden]="!group.get(config.name).errors.required">{{config.label | titlecase}} is required.</div>
      //  <div *ngIf="group.get(config.name) = 'phone'">
      //           </div>
      // <div *ngIf="config.name==='phone'">
      //     <div [hidden]="!group.get(config.name).errors.patternInvalid">{{config.label | titlecase}} is invalid.</div>
      // </div>

      // @property {boolean} $untouched True if control has not lost focus yet.
      // @property {boolean} $touched True if control has lost focus.
      // @property {boolean} $pristine True if user has not interacted with the control yet.
      // @property {boolean} $dirty True if user has already interacted with the control.



      // <div *ngIf="(group.get(config.name).touched && group.get(config.name).pristine)" class="invalid-feedback">

      //     <div  ng-show="group.get(config.name).errors.required">{{config.label | titlecase}} is required.</div>
      // </div>



    //   <div  *ngIf="group.get(config.name).touched && group.get(config.name).hasError('required')">
    //   <div>{{config.label | titlecase}}  is required</div>
    // </div>