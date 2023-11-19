import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from './interface/video-data';
import { CompactVideoData } from './interface/compact-video-data';


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
  safeUrlTitle:string ='';
  ytTextOrURL = '';
  relatedVideos: string[];
  videosData: VideoData[] = [];
  compactVideoData: CompactVideoData[] = [];
  playedVideoIds:string[] = [];
  videoType:string = 'Trending Videos';
  isVideoPlaying:boolean = false;
  isSearching:boolean = true;
  player!:YT.Player;
  hideSearchHeader:boolean = false;
  serviceBaseUrl:string = "https://youtube-services.onrender.com/";

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
      }
      this.isSearching = false;
    })
  }

  searchTextOrURL() {
    if (this.ytTextOrURL.indexOf('watch?v=') > 1) {
      let startIndex = this.ytTextOrURL.indexOf('=')+1;
      let endIndex = this.ytTextOrURL.length;
      if (this.ytTextOrURL.indexOf('&') > 0) {
        endIndex = this.ytTextOrURL.indexOf('&');
      }
      this.showInMainFrameWithVideoId(this.ytTextOrURL.substring(startIndex, endIndex));
      this.updateRelatedVideos(this.ytTextOrURL.substring(startIndex, endIndex), false);
    } else if (this.ytTextOrURL.length > 0){
      this.isSearching = true;
      this.getSearchResults().subscribe((videoData: VideoData[]) => {
        if (videoData) {
          this.isVideoPlaying = false;
          this.videoType = 'Search Videos';
          this.videosData = videoData;
          this.clearRelatedVideos();
          this.isSearching = false;
        }
      })
    }
  }

  getSearchResults() : Observable<VideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': this.serviceBaseUrl
      })
    };
    return this.http.get<VideoData[]>(this.serviceBaseUrl + "search/query?q="+this.ytTextOrURL, httpOptions);
  }

  getTrendingResults() : Observable<VideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': this.serviceBaseUrl
      })
    };
    return this.http.get<VideoData[]>(this.serviceBaseUrl + "search/trending", httpOptions);
  }

  getRelatedVideos(videoId:string) : Observable<CompactVideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': this.serviceBaseUrl
      })
    };
    return this.http.get<CompactVideoData[]>(this.serviceBaseUrl + "search/related?videoId=" + videoId, httpOptions);
  }

  showSeachHeader() {
    this.hideSearchHeader = false;
    setTimeout(() => {
      this.hideSearchHeader = true;
    }, 20000)
  }

  playInMainFrameWithVideoId(videoId:string, title:string) {
    this.isVideoPlaying = true;
    this.hideSearchHeader = true;
    this.playedVideoIds.push(videoId);
    this.safeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(this.ytVideoBaseUrl + videoId + "?autoplay=1&showinfo=0&enablejsapi=1");
    this.safeUrlTitle = title;
    this.updateRelatedVideos(videoId, false);
    setTimeout(() => {
      this.player = new window.YT.Player('player', {});
      this.player.addEventListener("onStateChange", (event:any) => {
        console.log(event.data);
        if(event.data == YT.PlayerState.ENDED) {
          this.playInMainFrameWithVideoId(this.videosData[0].videoRenderer.videoId, this.videosData[0]!.videoRenderer!.title!.runs[0]!.text);
        }
      });
      this.player.addEventListener("onError", (event:any) => {
        setTimeout(() => {
        this.playInMainFrameWithVideoId(this.videosData[0].videoRenderer.videoId, this.videosData[0]!.videoRenderer!.title!.runs[0]!.text);
        }, 5000);
      })
    }, 1000);
  }

  updateRelatedVideos(videoId:string, appendVideos:boolean) {
    this.getRelatedVideos(videoId).subscribe((compactVideoData:CompactVideoData[]) => {
      if(compactVideoData) {
        this.compactVideoData = compactVideoData;
        if (!appendVideos) {
          this.clearRelatedVideos();
          this.clearVideosData();  
        }
        this.mapCompactDataToVideoData(compactVideoData);  
      }
    })
  }
  
  showInMainFrameWithVideoId(videoId:string) {
    this.isVideoPlaying = true;
    this.safeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(this.ytVideoBaseUrl + videoId);
    this.safeUrlTitle = '';
  }

  clearRelatedVideos() {
    this.relatedVideos = [];
  }

  clearVideosData() {
    this.videosData = []
  }

  mapCompactDataToVideoData(compactVideoData: CompactVideoData[]) {
    compactVideoData.forEach(compactData => {
      if (!this.playedVideoIds.includes(compactData.compactVideoRenderer.videoId) &&
          !this.relatedVideos.includes(compactData.compactVideoRenderer.videoId)) {
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
            },
            "publishedTimeText" : {
              "simpleText" : compactData.compactVideoRenderer.publishedTimeText.simpleText
            },
            "viewCountText" : {
              "simpleText" : compactData.compactVideoRenderer.viewCountText.simpleText
            },
            "longBylineText" : {
              "runs" : [
                {
                  "text" : compactData.compactVideoRenderer.longBylineText.runs[0].text
                }
              ]
            }
          }
        }
        this.videosData.push(videoData);
        this.relatedVideos.push(videoData.videoRenderer.videoId);
      }
    },
    () => {
      if (this.videosData.length > 0 && this.videosData.length < 30) {
        this.updateRelatedVideos(this.videosData[0].videoRenderer.videoId, true);
      }
    }
    )
  }
}