import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import { InputComponent } from './input.component';
import { ButtonComponent } from './button.component';
import { SelectComponent } from './select.component';
import { DateComponent } from './date.component';
// import { RadiobuttonComponent } from './radiobutton.component';
import { CheckboxComponent } from './checkbox.component';
import { LineComponent } from './line.component';
import { HeaderComponent } from './header.component';
import { DocComponent } from './doc.components';


const components = {
  input: InputComponent,
  button: ButtonComponent,
  select: SelectComponent,
  date: DateComponent,
  // radiobutton: RadiobuttonComponent,
  checkbox: CheckboxComponent,
  line: LineComponent,
  header: HeaderComponent,
  doc: DocComponent
};
@Directive({
  selector: '[dynamicField]'
})
export class DynamicFieldDirective implements Field, OnChanges, OnInit {
  @Input()
  config: FieldConfig;

  @Input()
  group: FormGroup;

  component: ComponentRef<Field>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) {}

  ngOnChanges() {
    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

  ngOnInit() {
    if (!components[this.config.type]) {
      const supportedTypes = Object.keys(components).join(', ');
      throw new Error(
        `Trying to use an unsupported type (${this.config.type}).
        Supported types: ${supportedTypes}`
      );
    }
    const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
    this.component = this.container.createComponent(component);
    this.component.instance.config = this.config;
    this.component.instance.group = this.group;
  }
}