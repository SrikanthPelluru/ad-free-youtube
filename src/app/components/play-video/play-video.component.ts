import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from 'src/app/constants/app-constants';
import { AddToQueue, PlayNext, VideoData } from 'src/app/interface/video-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-play-video',
  templateUrl: './play-video.component.html',
  styleUrls: ['./play-video.component.css']
})
export class PlayVideoComponent {
  src:SafeResourceUrl = '';
  title:string = '';
  videos:VideoData[] = [];
  player!:YT.Player;
  playNextVideoData:PlayNext[] = [];
  addToQueueData:AddToQueue[] = [];

  
  constructor(private sanitizer:DomSanitizer, private router:Router, private activatedRoute:ActivatedRoute, private appService:AppServiceService) {
    let videoId = this.activatedRoute.snapshot.params['videoId'];
    this.appService.currentVideoIdSource.next(this.sanitizer.bypassSecurityTrustResourceUrl(AppConstants.EMBED_YT_BASE_URL + videoId + "?autoplay=1&showinfo=0&enablejsapi=1&rel=0"));
    this.appService.currentVideoIdSource.subscribe(src => {this.src = src});
    this.appService.currentVideoTitleSource.subscribe(title => this.title = title);
    this.appService.searchVideoSource.subscribe(videos => this.videos = videos);
    this.addEventListners();
    this.appService.updateRelatedVideos(videoId, false);
    this.appService.showBackButtonSource.next(true);
  }

  play(videoId:string, title:string) {
    this.appService.updateRelatedVideos(videoId, false);
    this.appService.currentVideoIdSource.next(this.sanitizer.bypassSecurityTrustResourceUrl(AppConstants.EMBED_YT_BASE_URL + videoId + "?autoplay=1&showinfo=0&enablejsapi=1&rel=0"));
    this.appService.currentVideoTitleSource.next(title);
    this.router.navigate(['watch/' + videoId]);
    this.addEventListners();
  }

  addEventListners() {
    setTimeout( () => {
      this.player = new window.YT.Player('player', {});
      this.player.addEventListener("onStateChange", (event:any) => {
        if(event.data == YT.PlayerState.ENDED) {
          if (this.playNextVideoData && this.playNextVideoData.length > 0) {
            this.playNextVideo();
          } else if (this.addToQueueData && this.addToQueueData.length > 0) {
            this.playQueuedVideo();
          } else {
            this.play(this.videos[0]?.videoRenderer?.videoId, this.videos[0]?.videoRenderer?.title?.runs[0]?.text);
          }
        }
      });
      this.player.addEventListener("onError", (event:any) => {
        setTimeout(() => {
          if (this.playNextVideoData && this.playNextVideoData.length > 0) {
            this.playNextVideo();
          } else if (this.addToQueueData && this.addToQueueData.length > 0) {
            this.playQueuedVideo();
          } else {
            this.play(this.videos[0]?.videoRenderer?.videoId, this.videos[0]?.videoRenderer?.title?.runs[0]?.text);
          }
        }, 5000);
      });
    }, 3000);
  }

  playNext(videoId:string, title:string) {
    this.playNextVideoData.push({videoId, title});
  }

  addToQueue(videoId:string, title:string) {
    this.addToQueueData.push({videoId, title});
  }

  playNextVideo() {
    this.play(this.playNextVideoData[0].videoId, this.playNextVideoData[0].title);
    this.playNextVideoData.shift();
  }

  playQueuedVideo() {
    this.play(this.addToQueueData[0].videoId, this.addToQueueData[0].title);
    this.addToQueueData.shift();
  }

}
