import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-new-service-request',
  templateUrl: './edit-new-service-request.component.html',
  styleUrls: ['./edit-new-service-request.component.scss']
})
export class EditNewServiceRequestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }




  // handleSuccessResponse(data) {
  //   console.log(data);
  //   this.itemToSend = data;
  //   console.log(this.itemToSend);
  //   console.log(this.items);

  //   this.items = this.itemToSend.item.map(el => {
  //     if (el.text === 'Document') {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueReference.reference
  //       };
  //     }
  //     if (el.text === 'Health Exam Done Externally' || el.text === 'Dependent Involved' ) {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueBoolean
  //       };
  //     } else {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueString
  //       };
  //     }
  //   });

  //   console.log(this.items);
  // }

  // handleErrorResponse(error) {
  //   console.log(error);
  // }


  

}
