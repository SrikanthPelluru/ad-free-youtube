import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { LoadingComponent } from './components/loading/loading.component';
import { PlayVideoComponent } from './components/play-video/play-video.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { PlayShortsComponent } from './components/play-shorts/play-shorts.component';
import { ReelComponent } from './components/reel/reel.component';
import { VideoComponent } from './components/video/video.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {AsyncPipe} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    RecommendationsComponent,
    HeaderComponent,
    HomeComponent,
    LoadingComponent,
    PlayVideoComponent,
    SearchResultComponent,
    PlayShortsComponent,
    ReelComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    YouTubePlayerModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    AsyncPipe
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
