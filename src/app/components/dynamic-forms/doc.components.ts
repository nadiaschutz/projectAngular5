import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from './field.interface';
import { FieldConfig } from './field-config.interface';
import * as FHIR from '../../interface/FHIR';
import { QuestionnaireService } from '../../service/questionnaire.service';

@Component({
  selector: 'form-documents',
  template: `
  <div [class]="config.class">
  <section class="form-section last-element">
                <div class="table-list">



                  <div class="col-12-custom" *ngIf="documents">
                      <h6>documents</h6>
                      <div class="button-section">
                          <span class="btn regular-button btn-file" (change)='addDocument($event)'>
                            Add Documents <input type="file">
                          </span>
                        </div>
                        <div>
                            <table class="table">
                                <thead class="header-table">
                                  <tr>
                                    <th scope="col">#ID</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Document Name</th>
                                    <th scope="col">Document Type</th>
                                    <th scope="col">File Type</th>
                                    <th scope="col">File Size</th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>

                                  </tr>
                                </thead>
                                <tbody class="body-table">

                                <tr *ngFor="let doc of documents">
                                <td>{{doc['id']}}</td>
                                <td >{{doc['content'][0]['attachment']['creation'] | date: 'dd/MM/yyyy'}}</td>
                                <td class="cursor" (click)="downloadFile(doc)">{{doc['content'][0]['attachment']['title']}}</td>
                                <td>Medical Note</td>
                                <td>{{doc['content'][0]['attachment']['contentType']}}</td>
                                <td>{{doc['content'][0]['attachment']['size'] }}</td>
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
  documents = [];
  itemReference;

  config: FieldConfig;
  group: FormGroup;

  constructor(
    private questionnaireService: QuestionnaireService,
  ) {}


  addDocument($event) {
    const documentReference = new FHIR.DocumentReference;
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept;
    const documentReferenceCoding = new FHIR.Coding;
    const content = new FHIR.Content;
    const contentAttachment = new FHIR.Attachment;
    const contentCode = new FHIR.Coding;
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
    reader.onloadend = function() {

      file = reader.result;
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

      documentReferenceCoding.code = '51851-4';
      documentReferenceCoding.system = 'http://loinc.org';
      documentReferenceCoding.display = 'Administrative note';

      documentReferenceCodeableConcept.coding = [ documentReferenceCoding];
      documentReferenceCodeableConcept.text = 'Administrative note';

      documentReference.instant = date;
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];

      that.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data =>   {
          that.retrieveDocuments(data),
          that.createItemReferenceObject(data);
        }
      );
      
      console.log (contentAttachment);
      
      return reader.result;
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };


  }




  createItemReferenceObject(data) {
    const obj: string = data.id;

    this.itemReference = {
      linkId: '30',
      // text: obj.content[0].attachment.title,
      text: 'Document',
      answer:  'DocumentReference/' + obj
    };

    this.questionnaireService.shareDocument(this.itemReference);
  }

  retrieveDocuments(data) {
    this.documents.push(data);
    console.log (this.documents);
  }

  downloadFile(name) {
    const sourceData =
      'data:' + name['content'][0]['attachment']['contentType'] +
      ';base64,' + name['content'][0]['attachment']['data'];
    console.log(sourceData);
    const downloadElement = document.createElement('a');
    const fileName = name['content'][0]['attachment']['title'] ;

    downloadElement.href = sourceData;
    downloadElement.download = fileName;
    downloadElement.click();
  }
}
