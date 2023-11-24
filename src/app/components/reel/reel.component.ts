import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReelItemRenderer } from 'src/app/interface/initial-video-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-reel',
  templateUrl: './reel.component.html',
  styleUrls: ['./reel.component.css']
})
export class ReelComponent {
  reelItemRenderer:ReelItemRenderer[] = []

  constructor(private appService:AppServiceService, private router:Router) {
    this.appService.reelItemRendererSource.subscribe(reels => this.reelItemRenderer = reels);
  }

  playShort(videoId:string, title:string) {
    this.appService.currentShortTitleSource.next(title);
    this.router.navigate(['shorts/' + videoId]);
  }
}
