import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData, VideoRenderer } from './interface/video-data';
import { CompactVideoData } from './interface/compact-video-data';
import { AppConstants } from './constants/app-constants';
import { ReelItemRenderer, YoutubeInitialData } from './interface/initial-video-data';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}