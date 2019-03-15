import { Component, OnInit } from '@angular/core';
import { QuestionnaireService } from '../../../service/questionnaire.service';
import * as FHIR from '../../../interface/FHIR';
import { Reference } from '@angular/compiler/src/render3/r3_ast';
import { formatDate } from '@angular/common';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { routerNgProbeToken } from '@angular/router/src/router_module';
import * as moment from 'moment';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss']
})
export class ListPageComponent implements OnInit {
  episodesOfCareList = [];
  patientList = [];
  questionnaireResponseList = [];
  episodeResultList = [];
  selectedEpisodes = [];
  admins = [];
  adminListWithIds = [];
  selectedEpisodeAdmin = null;
  taskList = [];
  taskResultList = [];
  selectedTasks = [];
  selectedTaskAdmin = null;
  activeTab = 'serviceRequest';
  selectAllEpisodesCheck = false;
  selectAllTasksCheck = false;

  constructor(
    private questionnaireService: QuestionnaireService,
    private staffService: StaffService,
    private utilService: UtilService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getAllAdmins();
    this.staffService
      .getAllUnassignedQuestionnaireResponses()
      .subscribe(data => {
        this.mapToEpisodeOfCare(data);
        // this.getServiceTypeFromQuestionnaireResponse(data);
        this.staffService.getAllEpisodeOfCare().subscribe(episodes => {
          this.buildEpisodeResponseObject(episodes);
        });
      });
    this.staffService.getAllTasks().subscribe(tasks => {
      if (tasks['entry']) {
        this.buildTaskResponseObject(tasks);
      }
    });
  }

  mapToEpisodeOfCare(questionnaireData) {
    questionnaireData.entry.forEach(entry => {
      // Only the Questionnaire Responses that have a patient associated to them are
      // mapped to Episode of Care
      const questionnaireResponse = entry.resource;
      if (questionnaireResponse.subject && !questionnaireResponse.context) {
        if (questionnaireResponse['identifier']) {
          if (questionnaireResponse['identifier']['value'] === 'SERVREQ') {
            const episodeOfCare = new FHIR.EpisodeOfCare();
            episodeOfCare.resourceType = 'EpisodeOfCare';
            episodeOfCare.status = 'planned';

            const type = new FHIR.CodeableConcept();
            type.text = 'Episode of Care';
            episodeOfCare.type = [type];

            const managingOrganization = new FHIR.Reference();
            managingOrganization.reference = 'Organization/NOHIS';

            const patient = new FHIR.Reference();
            patient.reference = questionnaireResponse.subject.reference;
            episodeOfCare.patient = patient;

            const period = new FHIR.Period();
            period.start = formatDate(new Date(), 'yyyy-MM-dd', 'en');
            episodeOfCare.period = period;

            this.staffService
              .saveEpisodeOfCare(JSON.stringify(episodeOfCare))
              .subscribe(
                createdEpisodeOfCare => {
                  const reference = new FHIR.Reference();
                  reference.reference =
                    '/EpisodeOfCare/' + createdEpisodeOfCare['id'];
                  this.associateCarePlanToEpisodeOfCare(
                    createdEpisodeOfCare,
                    questionnaireResponse
                  );
                  // Questionnaire Response needs to be updated
                  // to refer to the created episode of care
                  questionnaireResponse['context'] = reference;
                  this.questionnaireService
                    .changeRequest(questionnaireResponse)
                    .subscribe(
                      data => {
                        console.log(data);
                      },
                      error => console.error(error)
                    );
                },
                error => {
                  console.error(error);
                }
              );
          }
        }
      } else {
        // Check if all Questionnaire Responses have Care Plans associated to them
        if (questionnaireResponse.context) {
          const associatedEpisodeOfCareId = this.utilService.getIdFromReference(
            questionnaireResponse['context'].reference
          );
          this.staffService
            .getCarePlanForEpisodeOfCareId(associatedEpisodeOfCareId)
            .subscribe(data => {
              if (!data['entry']) {
                this.staffService
                  .getEpisodeOfCareFromId(associatedEpisodeOfCareId)
                  .subscribe(episodeOfCare => {
                    this.associateCarePlanToEpisodeOfCare(
                      episodeOfCare,
                      questionnaireResponse
                    );
                  });
              }
            });
        }
      }
    });
  }

  resetData() {
    this.episodesOfCareList = [];
    this.patientList = [];
    this.questionnaireResponseList = [];
    this.episodeResultList = [];
    this.selectedEpisodes = [];
    this.selectedEpisodeAdmin = null;
    this.selectAllEpisodesCheck = false;
  }

  buildEpisodeResponseObject(episodes) {
    this.resetData();
    episodes.entry.forEach(element => {
      const resource = element.resource;
      if (resource.resourceType === 'EpisodeOfCare') {
        this.episodesOfCareList[resource.id] = resource;
      } else if (resource.resourceType === 'QuestionnaireResponse') {
        // if (resource['identifier']) {
        //   if (resource['identifier']['value'] === 'SERVREQ') {
        if (resource.context) {
          const associatedEpisodeOfCareId = this.getIdFromReference(
            resource.context.reference
          );
          // Creating a Questionnaire Response List that can refer individual Questionnaire Response
          // item from an episode of Care id
          this.questionnaireResponseList[associatedEpisodeOfCareId] = resource;
        }
        //   }
        // }
      } else if (resource.resourceType === 'Patient') {
        this.patientList[resource.id] = resource;
      }
    });
    this.episodesOfCareList.forEach(episode => {
      const temp = {};
      temp['episodeOfCareId'] = episode['id'];
      temp['clientName'] = this.getClientName(episode['patient']['reference']);
      temp['serviceAssessmentType'] = this.getServiceAssessmentType(episode['id']);
      temp['clientDepartment'] = this.getClientDepartment(episode['id']);
      temp['daysInQueue'] = this.getDaysInQueue(episode['period']['start']);
      temp['status'] = episode['status'];
      if (episode['careManager']) {
        temp['careManager'] = this.getAdminNameFromReference(
          episode['careManager']['reference']
        );
      } else {
        temp['careManager'] = 'Unassigned';
      }

      this.episodeResultList.push(temp);
      // console.log(this.episodeResultList);
    });
    this.selectedEpisodes = new Array(this.episodeResultList.length);
  }

  setEOCID(data) {
    sessionStorage.setItem('selectedEpisodeId', data);
    this.router.navigateByUrl('/staff/work-screen');
  }

  getClientName(patientReference: string) {
    let lastName = '';
    let firstName = '';
    if (patientReference) {
      const patientId = this.getIdFromReference(patientReference);
      const patient = this.patientList[patientId];
      patient['name'].forEach(patientName => {
        lastName = patientName['family'];
        firstName = patientName['given'][0];
      });
      return lastName + ' ' + firstName;
    }
  }

  getServiceAssessmentType(episodeOfCareId) {
    return this.getQuestionnaireResponseItemByLinkId(episodeOfCareId, 'PSOHPSERV');
  }

  getClientDepartment(episodeOfCareId) {
    return this.getQuestionnaireReponseItem(
      episodeOfCareId,
      'Submitting Department'
    );
  }

  getQuestionnaireResponseItemByLinkId(eocId, linkId) {
    const questionnaireResponse = this.questionnaireResponseList[eocId];
    console.log(questionnaireResponse)
    let serviceName = '';
    if (questionnaireResponse) {
      questionnaireResponse.item.forEach(item => {
        if (item['linkId'] === linkId) {
          for (const answer of item['answer']) {
            if (answer['valueCoding']) {
              serviceName = answer['valueCoding']['display'];
            }
          }
        }
      });
    } else {
      console.log(eocId);
    }
    return serviceName;
  }

  getQuestionnaireReponseItem(episodeOfCareId, itemText) {
    let answer = '';
    const questionnaireResponse = this.questionnaireResponseList[
      episodeOfCareId
    ];
    // console.log(this.questionnaireResponseList[episodeOfCareId]);

    if (questionnaireResponse) {
      if (questionnaireResponse['identifier']) {
        if (questionnaireResponse && questionnaireResponse.item) {
          questionnaireResponse.item.forEach(item => {
            if (item.text === itemText) {
              // console.log('here we go!',  item['answer'][0]['valueString']);
              answer = item['answer'][0]['valueString'];
            }
          });
          return answer;
        }
      }
    }
  }

  getDaysInQueue(startDateString) {
    // if (startDateString.length > 0) {
    //   const startDate = new Date(startDateString);
    //   const currentDate = new Date;
    //   const diff = currentDate.getTime() - startDate.getTime();
    //   return Math.ceil(diff / (1000 * 3600 * 24));
    // }
    if (startDateString.length > 0) {
      // const startDate = new Date(startDateString);
      // const currentDate = new Date;
      // const diff = currentDate.getTime() - startDate.getTime();
      // return Math.ceil(diff / (1000 * 3600 * 24));
      return moment().diff(moment(startDateString), 'days');
    }

    return null;
  }

  assignEpisodeOfCare() {
    for (let i = 0; i < this.selectedEpisodes.length; i++) {
      if (this.selectedEpisodes[i]) {
        const selectedEpisodeOfCareId = this.episodeResultList[i][
          'episodeOfCareId'
        ];
        const episode = this.episodesOfCareList[selectedEpisodeOfCareId];
        console.log(this.selectedEpisodeAdmin);
        if (this.selectedEpisodeAdmin !== 'none') {
          const careManagerReference = new FHIR.Reference();
          careManagerReference.reference =
            'Practitioner/' + this.selectedEpisodeAdmin;
          episode.careManager = careManagerReference;
        } else {
          delete episode.careManager;
        }
        this.updateEpisodeOfCare(episode);
      }
    }
  }

  updateEpisodeOfCare(episode) {
    const episodeString = JSON.stringify(episode);
    this.staffService
      .updateEpisodeOfCare(episode.id, episodeString)
      .subscribe(data => {
        this.staffService.getAllEpisodeOfCare().subscribe(episodes => {
          this.buildEpisodeResponseObject(episodes);
        });
      });
  }

  getAllAdmins() {
    this.staffService.getAllPractitioners().subscribe(data => {
      data['entry'].forEach(element => {
        const admin = element.resource;
        this.admins.push({
          id: admin.id,
          value: this.utilService.getNameFromResource(admin)
        });
        this.adminListWithIds[admin.id] = admin;
      });
    });
  }

  getAdminNameFromReference(adminReference) {
    const adminId = this.getIdFromReference(adminReference);
    const admin = this.adminListWithIds[adminId];
    return this.utilService.getNameFromResource(admin);
  }

  release(episodeOfCareId) {
    const episode = this.episodesOfCareList[episodeOfCareId];
    delete episode.careManager;
    this.updateEpisodeOfCare(episode);
  }

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

  resetTaskData() {
    this.taskResultList = [];
    this.taskList = [];
    this.selectedTasks = [];
    this.selectedTaskAdmin = null;
    this.selectAllTasksCheck = false;
  }

  buildTaskResponseObject(tasks) {
    this.resetTaskData();
    tasks.entry.forEach(element => {
      const task = element.resource;
      this.taskList[task.id] = task;
    });
    this.taskList.forEach(task => {
      const temp = {};
      temp['id'] = task.id;
      temp['priority'] = task['priority'];
      temp['description'] = task['description'];
      temp['serviceRequestId'] = this.getIdFromReference(
        task['context']['reference']
      );
      temp['from'] = formatDate(
        new Date(task['meta']['lastUpdated']),
        'yyyy-MM-dd',
        'en'
      );
      temp['dateCreated'] = this.getDaysInQueue(task['meta']['lastUpdated']);
      temp['status'] = task.status;
      if (task.owner) {
        temp['owner'] = this.getAdminNameFromReference(
          task['owner']['reference']
        );
      } else {
        temp['owner'] = 'Unassigned';
      }
      this.taskResultList.push(temp);
    });
    this.selectedTasks = new Array(this.taskResultList.length);
  }

  assignTaskToAdmin() {
    for (let i = 0; i < this.selectedTasks.length; i++) {
      if (this.selectedTasks[i]) {
        const ownerReference = new FHIR.Reference();
        ownerReference.reference = 'Practitioner/' + this.selectedTaskAdmin;
        const selectedTaskId = this.taskResultList[i]['id'];
        const task = this.taskList[selectedTaskId];
        delete task.owner;
        console.log(task);
        console.log(this.selectedTaskAdmin);
        task.owner = ownerReference;
        console.log(task);
        this.updateTask(task);
      }
    }
  }

  updateTask(taskData) {
    const taskDataString = JSON.stringify(taskData);
    this.staffService
      .updateTask(taskData.id, taskDataString)
      .subscribe(data => {
        this.staffService.getAllTasks().subscribe(tasks => {
          this.buildTaskResponseObject(tasks);
        });
      });
  }

  serviceRequest(activeTab) {
    this.activeTab = activeTab;
  }

  task(activeTab) {
    this.activeTab = activeTab;
  }

  selectAllEpisodes() {
    for (let i = 0; i < this.selectedEpisodes.length; i++) {
      if (this.selectAllEpisodesCheck) {
        this.selectedEpisodes[i] = true;
      } else {
        this.selectedEpisodes[i] = false;
      }
    }
  }

  selectAllTasks() {
    for (let i = 0; i < this.selectedTasks.length; i++) {
      if (this.selectAllTasksCheck) {
        this.selectedTasks[i] = true;
      } else {
        this.selectedTasks[i] = false;
      }
    }
  }


  getServiceTypeFromQuestionnaireResponse(questionnaireResponse) {

    let serviceType = '';
    if (questionnaireResponse['item']) {
      questionnaireResponse.item.forEach(item => {
        if (item['linkId'] === 'PSOHPSERV') {
          for (const answer of item['answer']) {
            if (answer['valueCoding']) {
              serviceType = answer['valueCoding']['code'];
              console.log('haha, ', serviceType);
              
            }
          }
        }
      });
    } else {
      console.log('buggy one', questionnaireResponse)
    }
    return serviceType;

  }

  associateCarePlanToEpisodeOfCare(
    episodeOfCare: FHIR.EpisodeOfCare,
    questionnaireResponse: FHIR.QuestionnaireResponse
  ) {
    const psohpServiceType = this.getServiceTypeFromQuestionnaireResponse(
      questionnaireResponse
    );
    if (psohpServiceType.length > 0) {
      this.staffService
        .fetchAllCarePlanTemplates()
        .subscribe(carePlanTemplates => {
          carePlanTemplates['entry'].forEach(element => {
            const carePlanTemplate = element.resource;

            if (psohpServiceType === carePlanTemplate['identifier'][0]['value']) {
              console.log(psohpServiceType);
              const carePlan = new FHIR.CarePlan();
              carePlan.resourceType = 'CarePlan';
              carePlan.status = 'active';
              carePlan.intent = 'plan';
              carePlan.subject = episodeOfCare.patient;

              const episodeOfCareReference = new FHIR.Reference();
              episodeOfCareReference.reference =
                'EpisodeOfCare/' + episodeOfCare.id;
              carePlan.context = episodeOfCareReference;

              carePlan.activity = carePlanTemplate['activity'];
              carePlan.description = carePlanTemplate['description'];
              carePlan.identifier = carePlanTemplate['identifier'];

              console.log(carePlan);
              this.staffService
                .saveCarePlan(JSON.stringify(carePlan))
                .subscribe(data => {
                  console.log(data);
                },
                error => {
                  console.log(error);
                });
            }

          });
        });
    } else {
      console.log('no assignment to careplan was made')
    }
  }
}
