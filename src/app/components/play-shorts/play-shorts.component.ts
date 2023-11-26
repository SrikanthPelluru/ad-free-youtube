import { DOCUMENT, ViewportScroller, Location } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from 'src/app/constants/app-constants';
import { Short } from 'src/app/interface/short-data';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-play-shorts',
  templateUrl: './play-shorts.component.html',
  styleUrls: ['./play-shorts.component.css']
})
export class PlayShortsComponent implements AfterViewInit {
  src!:SafeResourceUrl;
  title:string = '';
  player!:YT.Player;
  shorts:Short[] = [];
  currentPosition = window.scrollY;
  currentPlayingId:number;
  scrolled:boolean = false;
  playerList: YT.Player[] = [];
  uniqueShorts:string[] = [];

  constructor(private sanitizer:DomSanitizer, private location:Location,
    private appService:AppServiceService, @Inject(DOCUMENT) private _document: Document, 
    private activatedRoute:ActivatedRoute, private scroller:ViewportScroller) {
    this.appService.showBackButtonSource.next(true);
    let videoId = this.activatedRoute.snapshot.params['videoId'];
    let short:Short = {
      videoId: videoId,
      src: this.sanitizer.bypassSecurityTrustResourceUrl(AppConstants.EMBED_YT_BASE_URL + videoId + "?autoplay=1&showinfo=0&enablejsapi=1&rel=0"),
      title: this.appService.currentShortTitleSource.getValue()
    }
    this.shorts.push(short);
    this.uniqueShorts.push(videoId);
    this.currentPlayingId = 0;
    this.loadRelatedShorts(videoId);
    this._document.addEventListener("scroll", this.onContentScrolled);
  }

  ngAfterViewInit(): void {
    this.shorts.forEach((short, i) => {
      this.loadToPlayerList(i);
    });
  }

  shortAppended(i:number) {
    console.log("appended " + i);
  }

  backToHome() {
    this.location.back();
  }

  onContentScrolled = () => {
    let scroll = window.scrollY;
    if (scroll > this.currentPosition && !this.scrolled) {
      if (!this.scrolled) {
        this.scrolled = true;
        this.playNext();
      }
    } else if (scroll < this.currentPosition){
      if (!this.scrolled) {
        this.scrolled = true;
        if (this.currentPlayingId < 0) {
          this.scrolled = false;
          return;
        } else {
          const currentId = this.currentPlayingId;
          const previousId = currentId - 1;
          if (this.playerList[currentId])
            this.playerList[currentId].pauseVideo();
          if (this.playerList[previousId])
            this.playerList[previousId].playVideo();
            
          setTimeout(() => {
            this.scroller.scrollToAnchor("" + previousId);
          }, 1000);
          
          setTimeout(() => {
            this.scroller.scrollToAnchor("" + previousId);
            this.scrolled = false;
            this.currentPosition = window.scrollY;
            this.currentPlayingId = previousId;
          }, 3000);
        }
      }
    }
  }

  loadRelatedShorts(videoId:string) {
    this.appService.getRelatedShorts(videoId).subscribe(videoIds => {
      videoIds.forEach(videoId => {
        if (!this.uniqueShorts.includes(videoId)) {
          let len = this.shorts.push ({
            videoId: videoId,
            src: this.sanitizer.bypassSecurityTrustResourceUrl(AppConstants.EMBED_YT_BASE_URL + videoId + "?autoplay=0&showinfo=0&enablejsapi=1&rel=0"),
            title: ''
          });
          this.uniqueShorts.push(videoId);
          this.loadToPlayerList(len-1); 
        }
      });
    })
  }

  loadToPlayerList(index:number) {
    if (document.getElementById(index+"") && window && window.YT && window.YT.Player) {
      let player:YT.Player = new YT.Player(index+"", {});
      player.addEventListener("onStateChange", (event:any) => {
        if(event.data == YT.PlayerState.ENDED) {
          this.playNext();
        }
      });
      player.addEventListener("onError", () => {
          this.playNext();
      });
      this.playerList.push(player);
    } else {
      setTimeout(() => {
        this.loadToPlayerList(index);
      }, 1000);
    }
  }

  playNext() {
    const currentId = this.currentPlayingId;
    const nextId = currentId + 1;
    if (this.playerList[currentId])
      this.playerList[currentId].pauseVideo();
    if (this.playerList[nextId])
      this.playerList[nextId].playVideo();

      
    setTimeout(() => {
      this.scroller.scrollToAnchor("" + nextId);
    }, 1000);
    
    setTimeout(() => {
      this.scroller.scrollToAnchor("" + nextId);
      this.scrolled = false;
      this.currentPosition = window.scrollY;
      this.currentPlayingId = nextId;
      if ((this.shorts.length - this.currentPlayingId) < 30) {
        this.loadRelatedShorts(this.shorts[this.currentPlayingId].videoId);
      }
    }, 3000);
  }
}
