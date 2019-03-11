import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
// export class DashboardComponent implements AfterContentInit, AfterViewInit{
export class DemoComponent implements AfterViewInit {

  // var for styling each form field
  style = 'col-5';



  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [
    {
      type: 'header',
      label: 'New Form'
    },
    {
      type: 'input',
      label: 'Username',
      inputType: 'text',
      placeholder: 'Enter your name',
      name: 'name',
      validation: [Validators.required, Validators.minLength(4)]
    },
    {
      type: 'input',
      label: 'Phone',
      inputType: 'text',
      placeholder: 'Enter your phone',
      name: 'phone',
      validation: [
        Validators.required,
        // CustomValidator.numberValidator,
        Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$')
      ]
    },
    {
      type: 'input',
      label: 'Email Address',
      inputType: 'email',
      placeholder: 'Enter your email',
      name: 'email',
      validation: [Validators.required, Validators.email]
    },
    {
      type: 'input',
      label: 'Password',
      inputType: 'password',
      name: 'password',
      placeholder: 'Enter your ps',
      validation: [Validators.required]
      // validations: [
      //   {
      //     name: "required",
      //     validator: Validators.required,
      //     message: "Password Required"
      //   }
      // ]
    },
    // {
    //   type: "radiobutton",
    //   label: "Gender",
    //   name: "gender",
    //   options: ["Male", "Female"],
    //   value: "Male"
    // },
    {
      type: 'date',
      label: 'Date',
      name: 'dob',
      validation: [Validators.required]
    },
    {
      type: 'select',
      label: 'Country',
      name: 'country',
      value: 'UK',
      options: ['India', 'UAE', 'UK', 'US'],
      placeholder: 'Select an option',
      validation: [Validators.required]
    },
    {
      type: 'checkbox',
      label: 'Accept Terms',
      name: 'term',
      validation: [Validators.required]
    },

    {
      type: 'select',
      label: 'Favourite Food',
      name: 'food',
      options: ['Pizza', 'Hot Dogs', 'Knakworstje', 'Coffee'],
      placeholder: 'Select an option',
      validation: [Validators.required]
    },
    {
      type: 'line'
    },
    {
      type: 'doc'
    },
    {
      type: 'button',
      name: 'submit',
      label: 'Save'
    }
  ];



  ngAfterViewInit() {
    setTimeout(() => {

      let previousValid = this.form.valid;
      this.form.changes.subscribe(() => {
        if (this.form.valid !== previousValid) {
          previousValid = this.form.valid;
          this.form.setDisabled('submit', !previousValid);
        }


      });

      this.form.setDisabled('submit', true);
      this.form.setDisabled('name', true);
      this.form.setValue('name', 'Nadia');

    });


    // if you want to style 2 form fields per a row do these :
    this.wrap();
    this.addDiv();
    // the end

  }

  submit(value: { [name: string]: any }) {
    console.log(value);
  }


  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      console.log(x[i]);
      $(x[i]).wrap("<div class='" + this.style + "'></div>");
    }
  }



  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll("<div class='row'></div>");
    }
  }
}
