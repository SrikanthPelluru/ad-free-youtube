import { AfterContentInit, AfterViewInit, Component, HostListener } from '@angular/core';
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
export class AppComponent {

  title = 'Add free youtube';
  ytVideoBaseUrl:string = 'https://www.youtube.com/embed/';
  ytThumbnailBaseUrl:string = 'https://img.youtube.com/vi/';
  safeUrl:SafeResourceUrl='';
  ytTextOrURL = '';
  relatedVideos: string[];
  videosData: VideoData[] = [];
  compactVideoData: CompactVideoData[] = [];
  playedVideoIds:string[] = [];

  constructor(private sanitizer:DomSanitizer, private http: HttpClient) {
    this.relatedVideos = [];
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
    } else {
      this.getSearchResults().subscribe((videoData: VideoData[]) => {
        if (videoData) {
          this.videosData = videoData;
          this.clearRelatedVideos();
          this.showInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
          //this.playInMainFrameWithVideoId(videoData[0].videoRenderer.videoId);
          videoData.forEach( data => {
            this.addThumbnailToRelatedVideos(data.videoRenderer.videoId);
          })
        }
      })
    }
  }

  getSearchResults() : Observable<VideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'http://13.126.48.46:8080'
      })
    };
    return this.http.get<VideoData[]>("http://13.126.48.46:8080/search/query?q="+this.ytTextOrURL, httpOptions);
  }

  getRelatedVideos(videoId:string) : Observable<CompactVideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'http://13.126.48.46:8080'
      })
    };
    return this.http.get<CompactVideoData[]>("http://13.126.48.46:8080/search/related?videoId=" + videoId, httpOptions);
  }

  playInMainFrameWithVideoId(videoId:string) {
    this.playedVideoIds.push(videoId);
    this.safeUrl= this.sanitizer.bypassSecurityTrustResourceUrl(this.ytVideoBaseUrl + videoId + "?autoplay=1&showinfo=0");
    this.getRelatedVideos(videoId).subscribe((compactVideoData:CompactVideoData[]) => {
      if(compactVideoData) {
        this.compactVideoData = compactVideoData;
        this.clearRelatedVideos();
        this.clearVideosData();
        this.mapCompactDataToVideoData(compactVideoData);  
      }
    })
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