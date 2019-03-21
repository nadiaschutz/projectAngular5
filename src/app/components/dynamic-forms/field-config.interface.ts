import { ValidatorFn } from '@angular/forms';

export interface Validator {
  name: string;
  validator: any;
  message: string;
}
// export interface FieldConfig {
//   label?: string;
//   name?: string;
//   inputType?: string;
//   options?: string[];
//   collections?: any;
//   type: string;
//   value?: any;
//   validations?: Validator[];
// }



export interface FieldConfig {
  disabled?: boolean;
  readonly?: any;
  class?: string;
  elementClass?: string;
  label?: string;
  name?: string;
  inputType?: string;
  options?: string[];
  placeholder?: string;
  type: string;
  validation?: ValidatorFn[];
  value?: any;
  val?: any;
  validations?: Validator[];
  selected?: any;
  enableWhen?: any;
  flag?: boolean;
}
