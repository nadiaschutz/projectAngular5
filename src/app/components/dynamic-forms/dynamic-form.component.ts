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


    // form = new FormGroup({
    //   first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
    //   last: new FormControl('Drew', Validators.required)
    // });


    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }


  setReadOnly(name: string, readonly: boolean) {
    if (this.form.controls[name]) {
      const method = readonly ? 'readonly' : 'null';
      this.form.controls[name][method]();
      return;
    }


    // form = new FormGroup({
    //   first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
    //   last: new FormControl('Drew', Validators.required)
    // });


    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.readonly = readonly;
      }
      return item;
    });
  }

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
