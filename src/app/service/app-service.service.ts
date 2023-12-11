import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoData, VideoRenderer } from '../interface/video-data';
import { ReelItemRenderer, YoutubeInitialData } from '../interface/initial-video-data';
import { AppConstants } from '../constants/app-constants';
import { CompactVideoData } from '../interface/compact-video-data';
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { SearchData } from '../interface/search-data';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {
  
  isLoadingSource: BehaviorSubject<boolean> = new BehaviorSubject(true);
  videoRendererSource:BehaviorSubject<VideoRenderer[]> = new BehaviorSubject<VideoRenderer[]>([]);
  trendingVideoRendererSource:BehaviorSubject<VideoRenderer[]> = new BehaviorSubject<VideoRenderer[]>([]);
  reelItemRendererSource:BehaviorSubject<ReelItemRenderer[]> = new BehaviorSubject<ReelItemRenderer[]>([]);
  searchVideoSource:BehaviorSubject<VideoData[]> = new BehaviorSubject<VideoData[]>([]);
  currentVideoIdSource:BehaviorSubject<SafeResourceUrl> = new BehaviorSubject<SafeResourceUrl>('');
  currentVideoTitleSource:BehaviorSubject<string> = new BehaviorSubject<string>("");
  
  currentShortVideoSource:BehaviorSubject<SafeResourceUrl> = new BehaviorSubject<SafeResourceUrl>('');
  currentShortTitleSource:BehaviorSubject<string> = new BehaviorSubject<string>("");

  showBackButtonSource:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  playedVideoIds:string[] = [];
  relatedVideoIds:string[] = [];

  constructor(private http: HttpClient, private router:Router) { }


  populateRecommendedVideos() {
    this.emptyTheRecommendedVideos();
    this.router.navigate(['']);
    this.showLoading();
    // var newWindow = window.open("https://www.youtube.com", '', 'height=,width=,resizable=no');
    // if (newWindow) {
    //   newWindow.onload = () => {
    //     console.log("yes it worked!!");
    //   }
    // }
    // newWindow?.addEventListener('load', () => {
    //   console.log("new page is loaded!!!");
    //   console.log(newWindow);
    // });
    this.loadRecommendations().subscribe((initialData:YoutubeInitialData) => {
      initialData.richGridRenderer.contents.forEach(content => {
        if (content && content.richItemRenderer && content.richItemRenderer.content && content.richItemRenderer.content.videoRenderer) {
          this.videoRendererSource.getValue().push(content.richItemRenderer.content.videoRenderer);
        }
        if (content && content.richSectionRenderer && content.richSectionRenderer.content && content.richSectionRenderer.content.richShelfRenderer &&
          content.richSectionRenderer.content.richShelfRenderer.title && content.richSectionRenderer.content.richShelfRenderer.title.runs[0].text === 'Shorts') {
            content.richSectionRenderer.content.richShelfRenderer.contents.forEach(reel => {
              this.reelItemRendererSource.getValue().push(reel.richItemRenderer.content.reelItemRenderer);
            }); 
        }

        if (content && content.richSectionRenderer && content.richSectionRenderer.content && content.richSectionRenderer.content.richShelfRenderer &&
          content.richSectionRenderer.content.richShelfRenderer.title && content.richSectionRenderer.content.richShelfRenderer.title.runs[0].text === 'Trending') {
          content.richSectionRenderer.content.richShelfRenderer.contents.forEach(video => {
            this.videoRendererSource.getValue().push(video.richItemRenderer.content.videoRenderer);
          });
        }

        if (content && content.richItemRenderer && content.richItemRenderer.content && content.richItemRenderer.content.reelItemRenderer != null) {
          this.reelItemRendererSource.getValue().push(content.richItemRenderer.content.reelItemRenderer);
        }
      });
      setTimeout(() => {
        if (this.reelItemRendererSource.getValue().length < 1)
          this.populateRecommendedVideos();
      }, 2000);
      this.hideLoading();
    });
  }

  loadRecommendations() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': AppConstants.SERVICE_BASE_URL
      })
    };
    return this.http.get<YoutubeInitialData>(AppConstants.SERVICE_BASE_URL + "search/initial", httpOptions);
  }

  emptyTheRecommendedVideos() {
    this.videoRendererSource.next([]);
    this.reelItemRendererSource.next([]);
  }

  populateTrendingVideos() {
    this.showLoading();
    this.getTrendingResults().subscribe((videoData: VideoData[]) => {
      if (videoData) {
        videoData.forEach(data => this.trendingVideoRendererSource.getValue().push(data.videoRenderer));
      }
      this.hideLoading();
    })
  }

  getTrendingResults() : Observable<VideoData[]> {
    return this.http.get<VideoData[]>(AppConstants.SERVICE_BASE_URL + "search/trending", this.getHttpHeaders());
  }

  search(q:string) {
    this.showLoading();
    this.getSearchResults(q).subscribe((videoData: SearchData) => {
      this.emptyTheRecommendedVideos();
      if (videoData && videoData.itemSectionRenderer && videoData.itemSectionRenderer.contents) {
        videoData.itemSectionRenderer.contents.forEach(content => {
          if (content.videoRenderer) {
            this.videoRendererSource.getValue().push(content.videoRenderer);
          }

          if (content.reelShelfRenderer && content.reelShelfRenderer.items) {
            content.reelShelfRenderer.items.forEach(item => {
              this.reelItemRendererSource.getValue().push(item.reelItemRenderer);
            })
          }
        })
      }
      this.hideLoading();
    })
  }

  getSearchResults(q:string) : Observable<SearchData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': AppConstants.SERVICE_BASE_URL
      })
    };
    return this.http.get<SearchData>(AppConstants.SERVICE_BASE_URL + "search/query?q="+q, httpOptions);
  }

  updateRelatedVideos(videoId: string, appendVideos:boolean) {
    this.playedVideoIds.push(videoId);
    this.getRelatedVideos(videoId).subscribe(compactVideoData => {
      if (compactVideoData) {
        if (!appendVideos) {
          this.emptySearchVideoSource();
          this.emptyRelatedVideos();
        }
        this.mapCompactDataToVideoData(compactVideoData);
        if (this.searchVideoSource.getValue().length > 0 && this.searchVideoSource.getValue().length < 20) {
          this.updateRelatedVideos(this.searchVideoSource.getValue()[0].videoRenderer?.videoId, true);
        }
      }
    })
  }

  emptyRelatedVideos() {
    this.relatedVideoIds = [];
  }

  emptySearchVideoSource() {
    this.searchVideoSource.next([]);
  }

  getRelatedVideos(videoId:string) : Observable<CompactVideoData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': AppConstants.SERVICE_BASE_URL
      })
    };
    return this.http.get<CompactVideoData[]>(AppConstants.SERVICE_BASE_URL + "search/related?videoId=" + videoId, httpOptions);
  }

  getRelatedShorts(videoId: string): Observable<string[]>{
    return this.http.get<string[]>(AppConstants.SERVICE_BASE_URL + "search/shorts?videoId=" + videoId, this.getHttpHeaders());
  }

  showLoading() {
    this.isLoadingSource.next(true);
  }

  hideLoading() {
    this.isLoadingSource.next(false);
  }

  mapCompactDataToVideoData(compactVideoData: CompactVideoData[]) {
    compactVideoData.forEach(compactData => {
      if (!this.playedVideoIds?.includes(compactData?.compactVideoRenderer?.videoId) &&
          !this.relatedVideoIds?.includes(compactData?.compactVideoRenderer?.videoId)) {
        let videoData:VideoData = {
          "videoRenderer" : {
            "videoId" : compactData?.compactVideoRenderer?.videoId,
            "title" : {
              "runs" : [
                {
                  "text" : compactData?.compactVideoRenderer?.title?.simpleText
                }
              ]
            },
            "thumbnail" : {
              "thumbnails" : [
                {
                  "url" : compactData?.compactVideoRenderer?.thumbnail?.thumbnails[0]?.url,
                  "height" : compactData?.compactVideoRenderer?.thumbnail?.thumbnails[0]?.height,
                  "width" : compactData?.compactVideoRenderer?.thumbnail?.thumbnails[0]?.width
                }
              ]
            },
            "lengthText" : {
              "simpleText" : compactData?.compactVideoRenderer?.lengthText?.simpleText
            },
            "publishedTimeText" : {
              "simpleText" : compactData?.compactVideoRenderer?.publishedTimeText?.simpleText
            },
            "viewCountText" : {
              "simpleText" : compactData?.compactVideoRenderer?.viewCountText?.simpleText
            },
            "longBylineText" : {
              "runs" : [
                {
                  "text" : compactData?.compactVideoRenderer?.longBylineText?.runs[0]?.text
                }
              ]
            }
          }
        }
        this.searchVideoSource.getValue().push(videoData);
        this.relatedVideoIds.push(videoData?.videoRenderer?.videoId);
      }
    })
  }

  getHttpHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': AppConstants.SERVICE_BASE_URL
      })
    };
    return httpOptions;
  }

}
