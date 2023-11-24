import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoData, VideoRenderer } from 'src/app/interface/video-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent {
  searchVideos:VideoData[] = [];
  videoRenderer:VideoRenderer[] = [];



  constructor(private appService:AppServiceService, private router:Router, private activatedRoute:ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.appService.search(param['q']);
    });
    this.appService.showBackButtonSource.next(true);
    this.appService.searchVideoSource.subscribe(videos => {
      this.searchVideos = videos;
    });
    this.appService.videoRendererSource.subscribe(videos => this.videoRenderer = videos);
  }

  play(videoId:string, title:string) {
    this.appService.updateRelatedVideos(videoId, false);
    this.appService.currentVideoTitleSource.next(title);
    this.router.navigate(['watch/' + videoId]);
  }
}
