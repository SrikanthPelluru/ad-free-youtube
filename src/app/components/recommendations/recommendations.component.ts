import { Component, ViewChild, OnInit } from '@angular/core';
import { VideoRenderer } from 'src/app/interface/video-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup: any;
  videos:VideoRenderer[] = [];
  trendingVideos:VideoRenderer[] = [];

  constructor(private appService:AppServiceService) {
  }

  ngOnInit(): void {
    this.appService.showBackButtonSource.next(false);
    this.appService.populateRecommendedVideos();
    this.appService.populateTrendingVideos();
    this.appService.videoRendererSource.subscribe(videos => this.videos = videos);
    this.appService.trendingVideoRendererSource.subscribe(videos => this.trendingVideos = videos);
  }

  onTabChanged() {
    if (this.tabGroup.tabSelected === '2') {
    }
  }
}
