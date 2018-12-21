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


    // this.wrap(document.querySelector('form-input'), document.createElement('div'));

    this.wrap();
    this.addDiv();
 
    }
  
    submit(value: {[name: string]: any}) {
      console.log(value);
    }

  //    wrap(el, wrapper) {
  //     el.parentNode.insertBefore(wrapper, el);
  //     wrapper.appendChild(el);
  // }
  
  wrap(){
    var x = $(".field-holder-2 form-input");
    console.log(x);
    // for (var i = 0; i < x.length; i += 2) {
    //   x.slice(i, i + 2).wrapAll("<div class='row'></div>");
     
    //   // el.wrapAll("<div class='col'></div>");
    // }
    for (var i = 0; i < x.length; i ++) {
      console.log(x[i]);
      $(x[i]).wrap("<div class='col'></div>");
    };
   
  }
  
  

    addDiv(){
      var sections = $(".dynamic-form .col");

      for (var i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll("<div class='row'></div>");
    }
  }
  }
  