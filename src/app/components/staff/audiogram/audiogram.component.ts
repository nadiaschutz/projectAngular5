import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-audiogram',
  templateUrl: './audiogram.component.html',
  styleUrls: ['./audiogram.component.scss']
})
export class AudiogramComponent implements OnInit {
    private episodeOfCareId: any;

  constructor(private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
      this.route.params.subscribe(params => {
          this.episodeOfCareId = params['eocId'];
          console.log("this.episodeOfCareId", this.episodeOfCareId)
      });
  }

    redirectToNewAudiogram(){
        this.router.navigateByUrl('/staff/audiogram/new/' + this.episodeOfCareId);
    }
    redirectToWorkSceen(){
        this.router.navigateByUrl('/staff/work-screen');
    }
}
