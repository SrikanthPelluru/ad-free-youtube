import { AfterContentInit, AfterViewInit, Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from './interface/video-data';
import { CompactVideoData } from './interface/compact-video-data';
import { YouTubePlayer} from '@angular/youtube-player'
import * as Player from '@vimeo/player';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'Add free youtube';
  ytVideoBaseUrl:string = 'https://www.youtube.com/embed/';
  ytThumbnailBaseUrl:string = 'https://img.youtube.com/vi/';
  safeUrl:SafeResourceUrl='';
  ytTextOrURL = '';
  relatedVideos: string[];
  videosData: VideoData[] = [];
  compactVideoData: CompactVideoData[] = [];
  playedVideoIds:string[] = [];
  videoType:string = '';
  isVideoPlaying:boolean = false;
  isSearching:boolean = true;
  player!:YT.Player;

  constructor(private sanitizer:DomSanitizer, private http: HttpClient) {
    this.relatedVideos = [];
  }
  ngOnInit(): void {
    this.populateTrendingVideos();
  }

  populateTrendingVideos() {
    this.isSearching = true;
    this.getTrendingResults().subscribe((videoData: VideoData[]) => {
      if (videoData) {
        this.isVideoPlaying = false;
        this.videoType = 'Trending Videos';
        this.videosData = videoData;
        this.clearRelatedVideos();
        this.showInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
        //this.playInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
        videoData.forEach( data => {
          this.addThumbnailToRelatedVideos(data.videoRenderer.videoId);
        })
      }
    })
    this.isSearching = false;
  }

  searchTextOrURL() {
    if (this.ytTextOrURL.indexOf('watch?v=') > 1) {
      let startIndex = this.ytTextOrURL.indexOf('=')+1;
      let endIndex = this.ytTextOrURL.length;
      if (this.ytTextOrURL.indexOf('&') > 0) {
        endIndex = this.ytTextOrURL.indexOf('&');
      }
      this.showInMainFrameWithVideoId(this.ytTextOrURL.substring(startIndex, endIndex));
      this.addThumbnailToRelatedVideos(this.ytTextOrURL.substring(startIndex, endIndex));
    } else if (this.ytTextOrURL.length > 0){
      this.isSearching = true;
      this.getSearchResults().subscribe((videoData: VideoData[]) => {
        if (videoData) {
          this.isVideoPlaying = false;
          this.videoType = 'Search Videos';
          this.videosData = videoData;
          this.clearRelatedVideos();
          this.showInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
          //this.playInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
          videoData.forEach( data => {
            this.addThumbnailToRelatedVideos(data.videoRenderer.videoId);
          })
        }
      })
      this.isSearching = false;
    }
  }

  getSearchResults() : Observable<VideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'https://youtube-services.onrender.com/'
      })
    };
    return this.http.get<VideoData[]>("https://youtube-services.onrender.com/search/query?q="+this.ytTextOrURL, httpOptions);
  }

  getTrendingResults() : Observable<VideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'https://youtube-services.onrender.com/'
      })
    };
    return this.http.get<VideoData[]>("https://youtube-services.onrender.com/search/trending", httpOptions);
  }

  getRelatedVideos(videoId:string) : Observable<CompactVideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'https://youtube-services.onrender.com/'
      })
    };
    return this.http.get<CompactVideoData[]>("https://youtube-services.onrender.com/search/related?videoId=" + videoId, httpOptions);
  }

  playInMainFrameWithVideoId(videoId:string) {
    this.isVideoPlaying = true;
    this.playedVideoIds.push(videoId);
    this.safeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(this.ytVideoBaseUrl + videoId + "?autoplay=1&showinfo=0&enablejsapi=1");
    this.getRelatedVideos(videoId).subscribe((compactVideoData:CompactVideoData[]) => {
      if(compactVideoData) {
        this.compactVideoData = compactVideoData;
        this.clearRelatedVideos();
        this.clearVideosData();
        this.mapCompactDataToVideoData(compactVideoData);  
      }
    })
    setTimeout(() => {
      this.player = new window.YT.Player('player', {});
      this.player.addEventListener("onStateChange", (event:any) => {
        if(event.data == 0) {
          this.playInMainFrameWithVideoId(this.videosData[0].videoRenderer.videoId);
        }
      })
    }, 5000);
  }
  
  onPlayerReady(event:Event) {
    console.log(event);
  }

  onStateChange(event:Event) {
    alert("Hammayya" );
  }

  showInMainFrameWithVideoId(videoId:string) {
    this.safeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(this.ytVideoBaseUrl + videoId);
  }

  addThumbnailToRelatedVideos(videoId: string) {
    let thumbnail = this.ytThumbnailBaseUrl + videoId +"/hqdefault.jpg"
      if (!this.relatedVideos.includes(thumbnail)) {
        this.relatedVideos.push(thumbnail);
      }
  }

  clearRelatedVideos() {
    this.relatedVideos = [];
  }

  clearVideosData() {
    this.videosData = []
  }

  mapCompactDataToVideoData(compactVideoData: CompactVideoData[]) {
    compactVideoData.forEach(compactData => {
      if (!this.playedVideoIds.includes(compactData.compactVideoRenderer.videoId)) {
        let videoData:VideoData = {
          "videoRenderer" : {
            "videoId" : compactData.compactVideoRenderer.videoId,
            "title" : {
              "runs" : [
                {
                  "text" : compactData.compactVideoRenderer.title.simpleText
                }
              ]
            },
            "thumbnail" : {
              "thumbnails" : [
                {
                  "url" : compactData.compactVideoRenderer.thumbnail.thumbnails[0].url,
                  "height" : compactData.compactVideoRenderer.thumbnail.thumbnails[0].height,
                  "width" : compactData.compactVideoRenderer.thumbnail.thumbnails[0].width
                }
              ]
            },
            "lengthText" : {
              "simpleText" : compactData.compactVideoRenderer.lengthText.simpleText
            }
          }
        }
        this.videosData.push(videoData);
      }
    })
  }
}