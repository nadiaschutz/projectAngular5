import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import * as FHIR from '../../interface/FHIR';
import { QuestionnaireService } from '../../service/questionnaire.service';

interface HTMLAnchorElement {
  download: string;
}
@Component({
  selector: 'form-documents',
  template: `
  <div [class]="config.elementClass">
  <section class="form-section last-element">
                <div class="table-list">

 

                  <div class="col-12-custom" *ngIf="documents">
                      <h6>documents</h6>
                      <div [formGroup]="docFormGroup">
                          <label for="filetype">Select document category</label>
                          <select name="filetype" id="filetype" formControlName="filetype" (change)="enableUploadButton($event)" class="form-control" required>
                            <option *ngFor="let fileSelection of fileTypeList" [value]="fileSelection.value">
                              <span> {{fileSelection.viewValue}} </span>
                            </option>
                          </select>
                          <div *ngIf="docFormGroup.controls['filetype'].invalid
                                         && (docFormGroup.controls['filetype'].touched || docFormGroup.controls['filetype'].dirty)">
                            <div class="error-message">
                              Please make a selection
                            </div>
                          </div>
                      <div class="button-section">
                          <span class="btn regular-button btn-file"  (change)='addDocument($event)'>
                            Add Documents <input type="file" [disabled]="!enableFlag">
                          </span>
                        </div>
                        
                            <table class="table">
                                <thead class="header-table">
                                  <tr>
                                    <th scope="col">#ID</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Document Name</th>
                                    <th scope="col">Document Type</th>
                                    <th scope="col">File Type</th>
                                    <th scope="col">View File</th>

                                  </tr>
                                </thead>
                                <tbody class="body-table">

                                <tr *ngFor="let doc of documents">
                                <td>{{doc['id']}}</td>
                                <td >{{doc['content'][0]['attachment']['creation'] | date: 'dd/MM/yyyy'}}</td>
                                <td class="cursor" (click)="downloadFile(doc)">{{doc['content'][0]['attachment']['title']}}</td>
                                <td>{{doc['type']['text']}}</td>
                                <td>{{doc['content'][0]['attachment']['contentType']}}</td>
                                <td *ngIf="allowPreview(doc)" class="cursor" (click)="previewFile(doc)"> Preview this doc </td>
                                <td *ngIf="!allowPreview(doc)">No Preview available for this type of file </td>
                              </tr>

                                </tbody>

                              </table>
                        </div>

                    </div>
                    </div>
                    </section>
                    </div>

  `
})
export class DocComponent implements Field {

  // figure out how the doc uploads....
  // each time it uploads, give it a new name doc + 1, use for loop
  // check how all docs info transfers into new-serv-req.ts
  // if it sends only one name


  documents = [];
  itemReference;
  enableFlag = false;
  allowPreviewFlag = false;
  docFormGroup: FormGroup;
  fileTypeList = [
    { value: 'ADMINISTRATIVE', viewValue: 'ADMINISTRATIVE' },
    { value: 'INVOICE', viewValue: 'INVOICE' },
    { value: 'PSOHP-FORM', viewValue: 'PSOHP-FORM' },
    { value: 'OTHER', viewValue: 'OTHER' }
  ];
  config: FieldConfig;
  group: FormGroup;

  constructor(
    private questionnaireService: QuestionnaireService,
    private formBuilder: FormBuilder
  ) {
    this.docFormGroup = this.formBuilder.group({
      filetype: new FormControl(''),
    });
  }

  enableUploadButton(event) {
    if (event) {
      if (this.docFormGroup.get('filetype').value) {
        this.enableFlag = true;
        console.log(this.enableFlag);
      } else {
        this.enableFlag = false;
      }
    }
  }
  // on document upload
  addDocument($event) {
    const documentReference = new FHIR.DocumentReference;
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept;
    const documentReferenceCoding = new FHIR.Coding;
    const content = new FHIR.Content;
    const contentAttachment = new FHIR.Attachment;
    const contentCode = new FHIR.Coding;
    const documentReferenceAuthor = new FHIR.Reference();

    // sets the data to item to send
    documentReferenceAuthor.reference =
      'Practitioner/' + sessionStorage.getItem('userFHIRID');
    let file;
    let trimmedFile = '';
    let size: number;
    let type;
    const date = new Date().toJSON();
    console.log(date);
    const fileList = $event.target.files;
    const reader = new FileReader();
    if (fileList[0]) {
      size = fileList[0].size;
      type = fileList[0].type;
      reader.readAsDataURL(fileList[0]);
    }
    const that = this;
    reader.onloadend = function () {

      file = reader.result;
      console.log(file);

      trimmedFile = file.split(',').pop();

      documentReference.resourceType = 'DocumentReference';

      contentAttachment.size = size;
      contentAttachment.contentType = type;
      contentAttachment.data = trimmedFile;
      contentAttachment.creation = date;
      contentAttachment.title = fileList[0].name;

      contentCode.code = 'urn:ihe:pcc:xphr:2007';
      contentCode.display = 'Personal Health Records';

      content.format = contentCode;
      content.attachment = contentAttachment;

      documentReferenceCodeableConcept.coding = [documentReferenceCoding];
      documentReferenceCodeableConcept.text = that.docFormGroup.get(
        'filetype'
      ).value;

      documentReference.instant = date;
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];

      that.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data => {
          that.retrieveDocuments(data),
            // this where the reference is createed. change the link id for each....WORK HERE
            that.createItemReferenceObject(data);
        }
      );

      console.log('contentAttachment', contentAttachment);
      return reader.result;
    };

    reader.onerror = function (error) {
      console.log('ERROR: ', error);
    };
  }

  createItemReferenceObject(data) {
    const obj: string = data.id;

    this.itemReference = {
      linkId: '30',
      // text: obj.content[0].attachment.title,
      text: 'Document',
      answer: 'DocumentReference/' + obj
    };

    this.questionnaireService.shareDocument(this.itemReference);
  }

  retrieveDocuments(data) {
    this.documents.push(data);
    console.log(this.documents);
  }


  // check if it does anything
  downloadFile(incomingFile) {

    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);

    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['content'][0]['attachment']['title'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['content'][0]['attachment']['title'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }

  }


  // check if it does anything
  allowPreview(incomingFile) {
    if (incomingFile['content'][0]['attachment']['contentType'].includes('/pdf')) {
      this.allowPreviewFlag = true;
      return this.allowPreviewFlag;
    } else {
      this.allowPreviewFlag = false;
      return this.allowPreviewFlag;

    }
  }
  // check if it does anything
  previewFile(incomingFile) {
    console.log(incomingFile)
    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);
    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });
    const filename = incomingFile['content'][0]['attachment']['title'];

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      console.log(filename);
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.name = filename;
      fileLink.target = '_blank';
      fileLink.setAttribute('download', filename);
      window.open(fileLink.href);
    }
  }
}
