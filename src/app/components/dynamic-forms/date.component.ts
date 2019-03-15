import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';


@Component({
  selector: "form-date",
  template: `
 
    <div [formGroup]="group" [class]='config.elementClass'>

        <label class="label-name">{{ config.label }}</label>
        

       
        
        <input 
        class="form-control"
        [type]="config.type" 
        [formControlName]="config.name" />
      

        <div  *ngIf="group.get(config.name).touched && group.get(config.name).hasError('required')">
          <div>{{config.label | titlecase}}  is required</div>
        </div>
    </div>




        
        `
})
export class DateComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}