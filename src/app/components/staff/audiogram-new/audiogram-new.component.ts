import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BsDatepickerConfig} from 'ngx-bootstrap';

import {AudiogramService} from '../../../service/audiogram.service';
import {UtilService} from '../../../service/util.service';

import * as moment from 'moment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as FHIR from '../../../interface/FHIR';

@Component({
    selector: 'app-audiogram-new',
    templateUrl: './audiogram-new.component.html',
    styleUrls: ['./audiogram-new.component.scss']
})
export class AudiogramNewComponent implements OnInit {
    audioGramFormGroup: FormGroup;
    DATE_FORMAT = 'YYYY-MM-DD';
    selectedHearingLoss = null;
    selectedBaseLine = null;
    datePickerConfig: Partial<BsDatepickerConfig>;
    formValue = {
        dateOfTest: null,
        locationOfTest: null,
        devSerial: null,
        devModel: null,
        devCelibrationDate: null,
        examineID: null,
        baseLine: null,
        HearingLose: null,
        leftEar: {
            k0_5: null,
            k1: null,
            k2: null,
            k3: null,
            k4: null,
            k6: null,
            k8: null,
        },
        rightEar: {
            k0_5: null,
            k1: null,
            k2: null,
            k3: null,
            k4: null,
            k6: null,
            k8: null,
        }
    };
    eocId: any;
    eoc: any;
    patient: any;
    serviceRequest: any;
    locations: any;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private formBuilder: FormBuilder,
                private audiogramService: AudiogramService,
                private utilService: UtilService) {

        this.audioGramFormGroup = this.formBuilder.group({
            issued: new FormControl(''),
            locationOfTest: new FormControl(''),
            devSerial: new FormControl(''),
            devModel: new FormControl(''),
            devCelibrationDate: new FormControl(''),
            examineID: new FormControl(''),

            leftk_5: new FormControl('', Validators.required),
            leftk1: new FormControl('', Validators.required),
            leftk2: new FormControl('', Validators.required),
            left3k: new FormControl('', Validators.required),
            left4k: new FormControl('', Validators.required),
            left6k: new FormControl('', Validators.required),
            left8k: new FormControl('', Validators.required),

            right_0_5: new FormControl('', Validators.required),
            right_1k: new FormControl('', Validators.required),
            right_2k: new FormControl('', Validators.required),
            right_3k: new FormControl('', Validators.required),
            right_4k: new FormControl('', Validators.required),
            right_6k: new FormControl('', Validators.required),
            right_8k: new FormControl('', Validators.required),
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.eocId = params['eocId'];


            this.audiogramService.getEOCById(this.eocId).subscribe(bundle => {
                // console.log(bundle);
                if (bundle && bundle['entry'] && Array.isArray(bundle['entry']) && bundle['entry'].length > 0) {
                    bundle['entry'].map(item => {
                        const resource = item.resource;
                        if (resource.resourceType === 'EpisodeOfCare') {
                            this.eoc = resource;
                        } else if (resource.resourceType === 'Patient') {
                            this.patient = this.utilService.getPatientJsonObjectFromPatientFhirObject(resource);

                            if (this.patient && this.patient.workplace) {

                                this.audiogramService.getBundleFromOrganizationName(this.patient.workplace).subscribe(
                                    data => {
                                        if (data && data['entry'] && Array.isArray(data['entry']) && data['entry'].length > 0) {
                                            data['entry'].map(item => {
                                                const resource = item.resource;
                                                if (resource.resourceType === 'Organization') {
                                                    this.getLocations(resource.resourceType, resource.id);
                                                }
                                            });
                                        }
                                    },
                                    error => this.handleError(error)
                                );
                            }

                        } else if (resource.resourceType === 'QuestionnaireResponse') {
                            this.serviceRequest = resource; // qr
                        }
                    });
                }


            });
        });

        this.datePickerConfig = Object.assign(
            {},
            {containerClass: 'theme-dark-blue', dateInputFormat: this.DATE_FORMAT, rangeInputFormat: this.DATE_FORMAT}
        );
    }

    calculateAge(dateOfBirth) {
        // expects syntax == '1996-08-13' (YYYY - MM - DD)
        return moment().diff(dateOfBirth, 'years');
    }

    redirectToAudiogram() {
        this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
    }

    selectHearingLoss(type) {
        this.selectedHearingLoss = type;
        this.formValue.HearingLose = type;
    }

    selectBaseLine(type) {
        this.selectedBaseLine = type;
        this.formValue.baseLine = type;
    }

    getLocations(resourceType, resourseId) {

        this.audiogramService.getLocations(resourceType, resourseId).subscribe(
            data => {
                if (data && data['entry'] && data['entry'].length > 0) {
                    this.locations = data['entry'];
                }

                console.log('this.locationsthis.locationsthis.locations', this.locations)
            },
            error => this.handleError(error)
        );
    }

    saveAudiogram() {

        const device = new FHIR.Device;
        const udi = new FHIR.Udi;
        const note = new FHIR.Annotation;

        note.time = this.audioGramFormGroup.get('devCelibrationDate').value,
        note.text = 'calibration-date';

        udi.deviceIdentifier = this.audioGramFormGroup.get('devSerial').value;

        device.udi = udi;
        device.model = this.audioGramFormGroup.get('devModel').value,
        device.note = [note];
        device.resourceType = 'Device';


        // const deviceRequest = {
        //     'resourceType': 'Device',
        //     'udi': {
        //         'deviceIdentifier': 
        //     },
        //     'model': this.audioGramFormGroup.get('devModel').value,
        //     'note': [
        //         {
        //             'time': moment(this.audioGramFormGroup.get('devCelibrationDate').value).format(),
        //             'text': 'calibration-date'
        //         }
        //     ]
        // };


        this.audiogramService.postDevice(JSON.stringify(device)).subscribe(deviceData => {

            const audiogram = new FHIR.Observation;
            const extensionOne = new FHIR.Extension;
            const extensionTwo = new FHIR.Extension;

            const baseline = new FHIR.CodeableConcept;
            const baselineCoding = new FHIR.Coding;

            const categoryExam = new FHIR.CodeableConcept;
            const categoryExamCoding = new FHIR.Coding;

            const categoryAudiogram = new FHIR.CodeableConcept;
            const categoryAudiogramCoding = new FHIR.Coding;

            const hearingLoss = new FHIR.CodeableConcept;
            const hearingLossCoding = new FHIR.Coding;

            const leftEarComponent1 = new FHIR.Component;
            const leftEarComponent2 = new FHIR.Component;
            const leftEarComponent3 = new FHIR.Component;
            const leftEarComponent4 = new FHIR.Component;
            const leftEarComponent5 = new FHIR.Component;
            const leftEarComponent6 = new FHIR.Component;
            const leftEarComponent7 = new FHIR.Component;
            const rightEarComponent1 = new FHIR.Component;
            const rightEarComponent2 = new FHIR.Component;
            const rightEarComponent3 = new FHIR.Component;
            const rightEarComponent4 = new FHIR.Component;
            const rightEarComponent5 = new FHIR.Component;
            const rightEarComponent6 = new FHIR.Component;
            const rightEarComponent7 = new FHIR.Component;

            const rightEarComponent1Coding = new FHIR.Coding;
            const rightEarComponent2Coding = new FHIR.Coding;
            const rightEarComponent3Coding = new FHIR.Coding;
            const rightEarComponent4Coding = new FHIR.Coding;
            const rightEarComponent5Coding = new FHIR.Coding;
            const rightEarComponent6Coding = new FHIR.Coding;
            const rightEarComponent7Coding = new FHIR.Coding;
            const leftEarComponent1Coding = new FHIR.Coding;
            const leftEarComponent2Coding = new FHIR.Coding;
            const leftEarComponent3Coding = new FHIR.Coding;
            const leftEarComponent4Coding = new FHIR.Coding;
            const leftEarComponent5Coding = new FHIR.Coding;
            const leftEarComponent6Coding = new FHIR.Coding;
            const leftEarComponent7Coding = new FHIR.Coding;

            audiogram.subject = new FHIR.Reference;
            audiogram.context = new FHIR.Reference;
            audiogram.device = new FHIR.Reference;

            extensionOne.url = 'http://nohis.gc.ca/examiner';
            extensionOne.valueString = this.audioGramFormGroup.get('examineID').value;

            if (this.audioGramFormGroup.get('locationOfTest').value && this.audioGramFormGroup.get('locationOfTest').value !== '') {
                extensionTwo.url = 'http://nohis.gc.ca/test-location';
                extensionTwo.valueReference = new FHIR.Reference;
                extensionTwo.valueReference.reference = 'Location/' + this.audioGramFormGroup.get('locationOfTest').value;
            }

            audiogram.category = [];
            audiogram.component = [];

            categoryExamCoding.system = 'http://hl7.org/fhir/observation-category',
            categoryExamCoding.code = 'exam';
            categoryExamCoding.display = 'Exam';
            categoryExam.coding = [categoryExamCoding];
            categoryExam.text = 'Exam';

            categoryAudiogramCoding.system = 'http://nohis.gc.ca/observation-type';
            categoryAudiogramCoding.code = 'audiogram';
            categoryAudiogramCoding.display = 'Audiogram';
            categoryAudiogram.coding = [categoryAudiogramCoding];
            categoryAudiogram.text = 'Audiogram';

            audiogram.category.push(categoryAudiogram, categoryExam);

            if (this.selectedBaseLine === 'yes') {
                baselineCoding.system = 'http://nohis.gc.ca/observation-use';
                baselineCoding.code = 'baseline';
                baselineCoding.display = 'Baseline';

                baseline.coding = [baselineCoding];
                baseline.text = 'Baseline';

                audiogram.category.push(baseline);
            } else {
                audiogram.category = audiogram.category.filter(data => {
                    if (data.text !== 'Baseline') {
                        return data;
                    }
                });
            }

            hearingLossCoding.system = 'http://nohis.gc.ca/hearing-loss';
            hearingLossCoding.code = 'hearing-lost';
            hearingLossCoding.display = 'Hearing Loss';
            hearingLoss.coding = [hearingLossCoding];

            if (this.selectedHearingLoss === 'left') {
                hearingLoss.text = 'Left';
            }

            if (this.selectedHearingLoss === 'right') {
                hearingLoss.text = 'Right';
            }

            if (this.selectedHearingLoss !== null) {
                audiogram.category.push(hearingLoss);
            }

            leftEarComponent1Coding.system = 'http://loinc.org';
            leftEarComponent1Coding.code = '89024-4';
            leftEarComponent1Coding.display = 'Hearing threshold 500 Hz Ear-L';
            leftEarComponent1.code.coding = [leftEarComponent1Coding];
            leftEarComponent1.valueString = this.audioGramFormGroup.get('leftk_5').value;

            rightEarComponent1Coding.system = 'http://loinc.org';
            rightEarComponent1Coding.code = '89025-1';
            rightEarComponent1Coding.display = 'Hearing threshold 500 Hz Ear-R';
            rightEarComponent1.code.coding = [rightEarComponent1Coding];
            rightEarComponent1.valueString = this.audioGramFormGroup.get('right_0_5').value;


            leftEarComponent2Coding.system = 'http://loinc.org';
            leftEarComponent2Coding.code = '89016-0';
            leftEarComponent2Coding.display = 'Hearing threshold 1000 Hz Ear-L';
            leftEarComponent2.code.coding = [leftEarComponent2Coding];
            leftEarComponent2.valueString = this.audioGramFormGroup.get('leftk1').value;

            rightEarComponent2Coding.system = 'http://loinc.org';
            rightEarComponent2Coding.code = '89017-8';
            rightEarComponent2Coding.display = 'Hearing threshold 1000 Hz Ear-R';
            rightEarComponent2.code.coding = [rightEarComponent2Coding];
            rightEarComponent2.valueString = this.audioGramFormGroup.get('right_1k').value;

            leftEarComponent3Coding.system = 'http://loinc.org';
            leftEarComponent3Coding.code = '89018-6';
            leftEarComponent3Coding.display = 'Hearing threshold 2000 Hz Ear-L';
            leftEarComponent3.code.coding = [leftEarComponent3Coding];
            leftEarComponent3.valueString = this.audioGramFormGroup.get('leftk2').value;

            rightEarComponent3Coding.system = 'http://loinc.org';
            rightEarComponent3Coding.code = '89019-4';
            rightEarComponent3Coding.display = 'Hearing threshold 2000 Hz Ear-R';
            rightEarComponent3.code.coding = [rightEarComponent3Coding];
            rightEarComponent3.valueString = this.audioGramFormGroup.get('right_2k').value;

            leftEarComponent4Coding.system = 'http://loinc.org';
            leftEarComponent4Coding.code = '89020-2';
            leftEarComponent4Coding.display = 'Hearing threshold 3000 Hz Ear-L';
            leftEarComponent4.code.coding = [leftEarComponent4Coding];
            leftEarComponent4.valueString = this.audioGramFormGroup.get('left3k').value;

            rightEarComponent4Coding.system = 'http://loinc.org';
            rightEarComponent4Coding.code = '89021-0';
            rightEarComponent4Coding.display = 'Hearing threshold 3000 Hz Ear-R';
            rightEarComponent4.code.coding = [rightEarComponent4Coding];
            rightEarComponent4.valueString = this.audioGramFormGroup.get('right_3k').value;

            leftEarComponent5Coding.system = 'http://loinc.org';
            leftEarComponent5Coding.code = '89023-6';
            leftEarComponent5Coding.display = 'Hearing threshold 4000 Hz Ear-L';
            leftEarComponent5.code.coding = [leftEarComponent5Coding];
            leftEarComponent5.valueString = this.audioGramFormGroup.get('left4k').value;

            rightEarComponent5Coding.system = 'http://loinc.org';
            rightEarComponent5Coding.code = '89021-0';
            rightEarComponent5Coding.display = 'Hearing threshold 4000 Hz Ear-R';
            rightEarComponent5.code.coding = [rightEarComponent5Coding];
            rightEarComponent5.valueString = this.audioGramFormGroup.get('right_4k').value;

            leftEarComponent6Coding.system = 'http://loinc.org';
            leftEarComponent6Coding.code = '89026-9';
            leftEarComponent6Coding.display = 'Hearing threshold 6000 Hz Ear-L';
            leftEarComponent6.code.coding = [leftEarComponent6Coding];
            leftEarComponent6.valueString = this.audioGramFormGroup.get('left6k').value;

            rightEarComponent6Coding.system = 'http://loinc.org';
            rightEarComponent6Coding.code = '89027-7';
            rightEarComponent6Coding.display = 'Hearing threshold 4000 Hz Ear-R';
            rightEarComponent6.code.coding = [rightEarComponent6Coding];
            rightEarComponent6.valueString = this.audioGramFormGroup.get('right_6k').value;

            leftEarComponent7Coding.system = 'http://loinc.org';
            leftEarComponent7Coding.code = '89028-5';
            leftEarComponent7Coding.display = 'Hearing threshold 8000 Hz Ear-L';
            leftEarComponent7.code.coding = [leftEarComponent7Coding];
            leftEarComponent7.valueString = this.audioGramFormGroup.get('left8k').value;

            rightEarComponent7Coding.system = 'http://loinc.org';
            rightEarComponent7Coding.code = '89029-3';
            rightEarComponent7Coding.display = 'Hearing threshold 8000 Hz Ear-R';
            rightEarComponent7.code.coding = [rightEarComponent7Coding];
            rightEarComponent7.valueString = this.audioGramFormGroup.get('right_8k').value;

            audiogram.component.push(
                leftEarComponent1,
                leftEarComponent2,
                leftEarComponent3,
                leftEarComponent4,
                leftEarComponent5,
                leftEarComponent6,
                leftEarComponent7,
                rightEarComponent1,
                rightEarComponent2,
                rightEarComponent3,
                rightEarComponent4,
                rightEarComponent5,
                rightEarComponent6,
                rightEarComponent7
            );
            audiogram.device.reference = 'Device/' + deviceData['id'];
            audiogram.subject.reference = 'Patient/' + this.patient.id;
            audiogram.context.reference = 'EpisodeOfCare/' + this.eocId;
            audiogram.issued = this.audioGramFormGroup.get('issued').value;
            audiogram.status = 'final';
            audiogram.extension = [extensionOne, extensionTwo];
            audiogram.resourceType = 'Observation';

            this.audiogramService.saveAudiogramRequest(JSON.stringify(audiogram)).subscribe(data => {
                this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
            });


        });

        // this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
    }

    handleError(error) {
        console.log(error);
    }


}
