import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { FieldConfig, Validator } from './field-config.interface';

@Component({
  exportAs: 'dynamicForm',
  selector: 'dynamic-form',
  template: `
    <form
      class="dynamic-form"
      [formGroup]="form"
      (submit)="handleSubmit($event)">
      <div class="field-holder-2">
      <ng-container
        *ngFor="let field of config;"
        dynamicField
        [config]="field"
        [group]="form">
      </ng-container>
      </div>
    </form>
  `
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() config: FieldConfig[] = [];

  @Output() submit: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;

  get controls() { return this.config.filter(({ type }) => type !== 'button'); }
  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }

  get value() { return this.form.value; }
  get getRawValue() { return this.form.getRawValue(); }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.createGroup();
  }

  ngOnChanges() {
    if (this.form) {
      const controls = Object.keys(this.form.controls);
      const configControls = this.controls.map((item) => item.name);

      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => this.form.removeControl(control));

      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.config.find((control) => control.name === name);
          this.form.addControl(name, this.createControl(config));
        });

    }
  }

  createGroup() {
    const group = this.fb.group({});
    this.controls.forEach(control => group.addControl(control.name, this.createControl(control)));
    return group;
  }

  /**
if you get an error on dynamic-form.components.ts,
there are 95% chances that the issue is not in dynamic-form.components.ts
but in data representation, or data absence ===> look into getFormData(data){}
**/

  createControl(fields: FieldConfig) {
    const { disabled, validation, value } = fields;
    return this.fb.control({ disabled, value }, validation);
  }


  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.form.controls[name][method]();
      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  // setValidation(name: string, value: any) {
  //   console.log('was not looking for anything', name, value);

  //   this.form.controls[name].setValidators(value);

  // }

  setRequired(name: string, validator: any) {
    this.form.controls[name].setValidators(validator);
    this.form.controls[name].updateValueAndValidity();
  }

  removeRequired(name: string) {
    this.form.controls[name].clearValidators();
    this.form.controls[name].updateValueAndValidity();
  }

  setPristine(name: string) {
    this.form.controls[name].markAsPristine();
  }


  // this.form.controls["firstName"].setValidators([Validators.minLength(1), Validators.maxLength(30)]);


  setValue(name: string, value: any) {
    this.form.controls[name].setValue(value, { emitEvent: true });
  }
}

// ngOnInit() {
//   this.form = this.createControl();
// }

// onSubmit(event: Event) {
//   event.preventDefault();
//   event.stopPropagation();
//   if (this.form.valid) {
//     this.submit.emit(this.form.value);
//   } else {
//     this.validateAllFormFields(this.form);
//   }
// }

// createControl() {
//   const group = this.fb.group({});
//   this.fields.forEach(field => {
//     if (field.type === "button") return;
//     const control = this.fb.control(
//       field.value,
//       this.bindValidations(field.validations || [])
//     );
//     group.addControl(field.name, control);
//   });
//   return group;
// }

// bindValidations(validations: any) {
//   if (validations.length > 0) {
//     const validList = [];
//     validations.forEach(valid => {
//       validList.push(valid.validator);
//     });
//     return Validators.compose(validList);
//   }
//   return null;
// }

// validateAllFormFields(formGroup: FormGroup) {
//   Object.keys(formGroup.controls).forEach(field => {
//     const control = formGroup.get(field);
//     control.markAsTouched({ onlySelf: true });
//   });
// }
// }
