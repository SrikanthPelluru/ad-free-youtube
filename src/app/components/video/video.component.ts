import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { VideoRenderer } from 'src/app/interface/video-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent {
  @Input('videos') videoRenderer!:VideoRenderer[];
  tabSelected:string = '';

  constructor(private appService:AppServiceService, private router:Router) {
  }

  playVideo(videoId:string, title:string) {
    this.appService.currentVideoTitleSource.next(title);
    this.router.navigate(['watch/' + videoId]);
  }
}
