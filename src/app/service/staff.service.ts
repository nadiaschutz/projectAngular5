import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as FHIR from '../interface/FHIR';

@Injectable({
  providedIn: 'root'
})

export class StaffService {

  selectedEpisodeId = '';

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  setSelectedEpisodeId(data) {
    sessionStorage.setItem('selectedEpisodeId', data);
  }

  getSelectedEpisodeId() {
    return sessionStorage.getItem('selectedEpisodeId');
  }

  getEpisodeOfCareFromId(episodeOfCareId) {
    return this.http.get<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare/' + episodeOfCareId, {headers: this.getHeaders()});
  }

  updateEpisodeOfCare(id, data) {
    return this.http.put(environment.queryURI + '/EpisodeOfCare/' + id, data, {headers: this.getPostHeaders()});
  }

  createQuestionnaireResponseAsync(data) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse', data, {headers: this.getPostHeaders()}).toPromise();
  }

  updateQuestionnaireResponseAsync(data) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + data['id'], data,
    {headers: this.getHeaders()}).toPromise();
  }

  changeRequest(data: any) {
    return this.http.put(
      environment.queryURI + '/QuestionnaireResponse/' + data['id'],
      data,
      { headers: this.getHeaders() }
    );
  }

  fetchAllCarePlanTemplates() {
    return this.http.get(environment.queryURI + '/CarePlan?status=draft', {headers: this.getHeaders()});
  }

  fetchAllCarePlanTemplatesAsync() {
    return this.http.get(environment.queryURI + '/CarePlan?status=draft', {headers: this.getHeaders()}).toPromise();
  }

  fetchAllCarePlans() {
    return this.http.get(environment.queryURI + '/CarePlan?status=active', {headers: this.getHeaders()});
  }

  saveCarePlan(carePlanData) {
    return this.http.post(environment.queryURI + '/CarePlan', carePlanData, {headers: this.getPostHeaders()});
  }

  saveCarePlanAsync(carePlanData) {
    return this.http.post(environment.queryURI + '/CarePlan', carePlanData, {headers: this.getPostHeaders()}).toPromise();
  }

  saveCommunicationRequestAsync(commReqdata) {
    return this.http.post(environment.queryURI + '/CommunicationRequest/', commReqdata, {headers: this.getPostHeaders()}).toPromise();
  }

  getCarePlan(id) {
    return this.http.get<FHIR.CarePlan>(environment.queryURI + '/CarePlan/' + id, {headers: this.getHeaders()});
  }

  getCarePlanForEpisodeOfCareId(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/CarePlan?context=' + episodeOfCareId, {headers: this.getHeaders()});
  }

  getCarePlanFromAssessmentType(assessmentType) {
    console.log(environment.queryURI +
      '/CarePlan?status=active&identifier=' + assessmentType);
    return this.http.get<FHIR.CarePlan>(environment.queryURI +
      '/CarePlan?status=active&identifier=' + assessmentType, {headers: this.getHeaders()});
  }

  updateCarePlan(id, carePlanData) {
    return this.http.put(environment.queryURI + '/CarePlan/' + id, carePlanData, {headers: this.getPostHeaders()});
  }

  getAllUnassignedQuestionnaireResponses() {
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?identifier=SERVREQ', {headers: this.getHeaders()});
  }

  getQuestionnaireResponseFromEpisodeOfCareId(episodeOfCareId) {
    return this.http.get(environment.queryURI +
      '/QuestionnaireResponse?identifier=SERVREQ&context=' + episodeOfCareId, {headers: this.getHeaders()});
  }

  saveEpisodeOfCare(data) {
    return this.http.post<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare', data, {headers: this.getPostHeaders()});
  }

  saveEpisodeOfCareAsync(data) {
    return this.http.post<FHIR.EpisodeOfCare>(environment.queryURI + '/EpisodeOfCare', data, {headers: this.getPostHeaders()}).toPromise();
  }

  getAllEpisodeOfCare() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare', {headers: this.getHeaders()});
  }

  getAllEpisodeOfCareAndRelatedData() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*', {headers: this.getHeaders()});
  }

  getAllEpisodeOfCareAndRelatedDataAsync() {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*', {headers: this.getHeaders()}).toPromise();
  }

  getEpisodeOfCareAndRelatedData(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*&_id='
    + episodeOfCareId, {headers: this.getNoCacheHeaders()});
  }

  getSampleEpisodeOfCareAndRelatedData(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_revinclude=*&_id='
    + episodeOfCareId, {headers: this.getHeaders()});
  }

   getEpisodeOfCareEagerLoading(episodeOfCareId) {
    return  this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_id='
        + episodeOfCareId, { headers: this.getHeaders() });
   }

  getAllPractitioners() {
    return this.http.get(environment.queryURI +
      '/Practitioner?_revinclude=PractitionerRole:code=admin', {
      headers: this.getHeaders()
    });
  }

  getPractitionerByID(query: string) {
    return this.http.get(environment.queryURI + '/Practitioner/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllPractitionerRoles() {
    return this.http.get(environment.queryURI + '/PractitionerRole/', {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByID(query: string) {
    return this.http.get(environment.queryURI + '/PractitionerRole/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllTasksForEpisodeOfCare(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/Task?context=' + episodeOfCareId, {
      headers: this.getHeaders()
    });
  }

  getIncludedItemsForEpisodeOfCare(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/EpisodeOfCare?_include=*&_id=' + episodeOfCareId, {
      headers: this.getHeaders()
    });
  }

  getAllEncountersReferencedByAnEpisodeOfCare(query: any) {
    return this.http.get(environment.queryURI + '/Encounter?episodeofcare=' + query, {
      headers: this.getHeaders()
    });
  }

  getAllDocumentReferencesByAnEncounter(query: any) {
    return this.http.get(environment.queryURI + '/DocumentReference?encounter=' + query, {
      headers: this.getNoCacheHeaders()
    });
  }

  getAnyFHIRObjectByReference(query: string) {
    return this.http.get(environment.queryURI + query, {
      headers: this.getHeaders()
    });
  }

  getAnyFHIRObjectByCustomQuery(query: string) {
    return this.http.get(environment.queryURI + '/' + query, {
      headers: this.getNoCacheHeaders()
    });
  }

  updateTask(id, data) {
    return this.http.put(environment.queryURI + '/Task/' + id, data, {
      headers: this.getPostHeaders()
    });
  }

  updateServiceRequest(id, data) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + id, data, {
      headers: this.getPostHeaders()
    });
  }

  saveTask(data) {
    return this.http.post(environment.queryURI + '/Task/', data, { headers: this.getPostHeaders() });
  }

  getTaskByID(query: string) {
    return this.http.get(environment.queryURI + '/Task/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllTasks() {
    return this.http.get(environment.queryURI + '/Task', {headers: this.getHeaders()});
  }

  getDocumentsBasedOnEncounter() {
    return this.http.get(environment.queryURI + '/Encounter', {headers: this.getNoCacheHeaders()});
  }

  createEncounter(encounter: any) {
    return this.http.post(environment.queryURI + '/Encounter', encounter,  {headers: this.getPostHeaders()});
  }

  createEncounterAsync(encounter: any) {
    return this.http.post(environment.queryURI + '/Encounter', encounter,  {headers: this.getPostHeaders()}).toPromise();
  }

  postDataFile(data: string) {
    return this.http.post(environment.queryURI + '/DocumentReference/', data, {
      headers: this.getPostHeaders()
    });
  }

  getDocumentsChecklist(context) {
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?context=' + context + '&identifier=RDCL', {
      headers: this.getNoCacheHeaders()
    });
  }

    getDocumentsChecklistLab(context) {
        return this.http.get(environment.queryURI + '/QuestionnaireResponse?context=' + context + '&identifier=RDCL', {
            headers: this.getHeaders()
        });
    }

  updateDocumentFile(id, doc) {
    return this.http.put(environment.queryURI + '/DocumentReference/' + id , doc, {
      headers: this.getPostHeaders()
    });
  }

  createDocumentsChecklist(checklist) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse/', checklist, {
      headers: this.getPostHeaders()});
  }

  updateDocumentsChecklist(id, questionnaire) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + id, questionnaire, {
      headers: this.getPostHeaders()
    });
  }

  getStatusList(context) {
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?context=' + context + '&identifier=MILESTONE', {
      headers: this.getHeaders()
    });
  }

  createStatusList(statuslist) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse/', statuslist, {
      headers: this.getPostHeaders()});
  }

  updateStatusList(id, data) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + id, data, {
      headers: this.getPostHeaders()
    });
  }
  

  getCommunicationRelatedToEpisodeOfCare(episodeOfCareId) {
    return this.http.get(environment.queryURI +
      '/Communication?context=' + episodeOfCareId, {headers: this.getHeaders()});
  }

  createCommunication(communicationData) {
    return this.http.post<FHIR.Communication>(environment.queryURI +
      '/Communication/', communicationData, {headers: this.getPostHeaders()});
  }

  updateCommunication(id, communicationData) {
    return this.http.put<FHIR.Communication>(environment.queryURI +
      '/Communication/' + id, communicationData, {headers: this.getPostHeaders()});
  }

  getAllClinicians() {
    return this.http.get(environment.queryURI +
      '/Practitioner?_has:PractitionerRole:practitioner:role=clinician', {
      headers: this.getHeaders()
    });
  }

  getClinicianById(id: string) {
    return this.http.get(environment.queryURI + '/Practitioner/' +  id, { headers: this.getHeaders() });
  }

  getClinicianAssignedToEpisode(episodeOfCareId) {
    return this.http.get(environment.queryURI + '/Task?code=clinician&status=ready&context=' + episodeOfCareId, {
      headers: this.getNoCacheHeaders()
    });
  }

  getLabTestQuestionnaire() {
    return this.http.get(environment.queryURI + '/Questionnaire/3476', {headers: this.getHeaders()});
  }

  saveProcedureRequest(procedureRequestData) {
    return this.http.post(environment.queryURI + '/ProcedureRequest', procedureRequestData, {headers: this.getPostHeaders()});
  }

  getAllProcedureRequests() {
    return this.http.get(environment.queryURI + '/ProcedureRequest', {headers: this.getHeaders()});
  }

  getProcedureRequestFromIdentifier(identifier: string) {
    return this.http.get(environment.queryURI + '/ProcedureRequest?identifier=' + identifier, {headers: this.getHeaders()});
  }

  saveClinicalQuestionnaireResponse(data) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse', data,  {headers: this.getPostHeaders()});
  }

  updateClinicalQuestionnaireResponse(id, data) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse/' + id, data, {
      headers: this.getPostHeaders()
    });
  }

  getVaccineList() {
    return this.http.get('/src/app/components/staff/clinical/immunization-screen/vaccine-list.json');
  }

  createImmunizationInfo(data) {
    return this.http.post(environment.queryURI + '/Immunization/', data, {
      headers: this.getPostHeaders()
    });
  }

  getAdministerededVaccinesFromServer(episodeOfCareId) {
    return this.http.get(
      environment.queryURI + '/Immunization?encounter.identifier=VACCINE-ENCOUNTER&encounter.episodeofcare='
      + episodeOfCareId, {headers: this.getNoCacheHeaders()});
  }

  saveAssessment(data) {
    return this.http.post(environment.queryURI + '/Observation/', data, {
      headers: this.getPostHeaders()
    });
  }

  getObservation(episodeOfCareId) {
    return this.http.get(
      environment.queryURI + '/Immunization?encounter.identifier=ASSESSMENT-ENCOUNTER&encounter.episodeofcare='
      + episodeOfCareId, {headers: this.getNoCacheHeaders()});
  }

  createAppointment(data) {
    return this.http.post(environment.queryURI + '/Appointment/', data, {
      headers: this.getPostHeaders()
    });
  }
  getNoCacheHeaders() {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken(),
      'Cache-Control': 'no-cache'
    });
    return headers;
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getPostHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }
}
