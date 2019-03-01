import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BsDatepickerConfig} from "ngx-bootstrap";

@Component({
  selector: 'app-audiogram-new',
  templateUrl: './audiogram-new.component.html',
  styleUrls: ['./audiogram-new.component.scss']
})
export class AudiogramNewComponent implements OnInit {
    selectedHearingLoss: any;
    selectedBaseLine: any;
    datePickerConfig: Partial<BsDatepickerConfig>;
    formValue = {
      dateOfTest : null,
      locationOfTest : null,
        devSerial: null,
        devModel: null,
        devCelibrationDate: null,
        examineID: null,
        baseLine: null,
        HearingLose: null,
        leftEar : {
          k0_5: null,
          k1: null,
          k2: null,
          k3: null,
          k4: null,
          k6: null,
          k8: null,
        },
        rightEar : {
            k0_5: null,
            k1: null,
            k2: null,
            k3: null,
            k4: null,
            k6: null,
            k8: null,
        }
    };
    private episodeOfCareId: any;

    constructor(private route: ActivatedRoute,
                private router: Router) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.episodeOfCareId = params['eocId'];
            console.log("this.episodeOfCareId", this.episodeOfCareId)
        });
    }

    redirectToAudiogram(){
        this.router.navigateByUrl('/staff/audiogram/' + this.episodeOfCareId);
    }

    selectHearingLoss(type){
      this.selectedHearingLoss = type;
      this.formValue.HearingLose = type;
    }

    selectBaseLine(type){
        this.selectedBaseLine = type;
        this.formValue.baseLine = type;
    }

    saveAudiogram(){
      console.log(this.formValue);

        this.router.navigateByUrl('/staff/audiogram/' + this.episodeOfCareId);
    }

}
