import { Component, ViewChild } from "@angular/core";
import { Validators } from "@angular/forms";
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from "../dynamic-forms/dynamic-form.component";
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
  })
  // export class DashboardComponent implements AfterContentInit, AfterViewInit{
    export class DashboardComponent {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    config: FieldConfig[] = [
      {
        type: "input",
        label: "Username",
        inputType: "text",
        placeholder: 'Enter your name',
        name: "name",
        validation: [Validators.required, Validators.minLength(4)]
        // validations: [
        //   {
        //     name: "required",
        //     validator: Validators.required,
        //     message: "Name Required"
        //   },
        //   {
        //     name: "pattern",
        //     validator: Validators.pattern("^[a-zA-Z]+$"),
        //     message: "Accept only text"
        //   }
        // ]
      },
      {
        type: "input",
        label: "Email Address",
        inputType: "email",
        placeholder: 'Enter your email',
        name: "email",
        validation: [Validators.required, Validators.email]
        // validations: [
        //   {
        //     name: "required",
        //     validator: Validators.required,
        //     message: "Email Required"
        //   },
        //   {
        //     name: "pattern",
        //     validator: Validators.pattern(
        //       "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"
        //     ),
        //     message: "Invalid email"
        //   }
        // ]
      },
      {
        type: "input",
        label: "Password",
        inputType: "password",
        name: "password",
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
    //   {
    //     type: "radiobutton",
    //     label: "Gender",
    //     name: "gender",
    //     options: ["Male", "Female"],
    //     value: "Male"
    //   },
    //   {
    //     type: "date",
    //     label: "DOB",
    //     name: "dob",
    //     validations: [
    //       {
    //         name: "required",
    //         validator: Validators.required,
    //         message: "Date of Birth Required"
    //       }
    //     ]
    //   },
    //   {
    //     type: "select",
    //     label: "Country",
    //     name: "country",
    //     value: "UK",
    //     options: ["India", "UAE", "UK", "US"]
    //   },
    //   {
    //     type: "checkbox",
    //     label: "Accept Terms",
    //     name: "term",
    //     value: true
    //   },

    {
      type: 'select',
      label: 'Favourite Food',
      name: 'food',
      options: ['Pizza', 'Hot Dogs', 'Knakworstje', 'Coffee'],
      placeholder: 'Select an option',
      validation: [Validators.required]
    },
      {
        type: "button",
        name: 'submit',
        label: "Save"
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
      this.form.setValue('name', 'Todd Motto');

    });
 
    }
  
    submit(value: {[name: string]: any}) {
      console.log(value);
    }
  }
  