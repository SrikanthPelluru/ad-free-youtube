import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { HomeComponent } from './components/home/home.component';
import { PlayVideoComponent } from './components/play-video/play-video.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { PlayShortsComponent } from './components/play-shorts/play-shorts.component';

const routes: Routes = [
  {
    path: '', component:HomeComponent, pathMatch:'full'
  },
  {
    path: 'watch/:videoId', component: PlayVideoComponent, pathMatch:'full'
  },
  {
    path: 'shorts/:videoId', component:PlayShortsComponent, pathMatch:'full'
  },
  {
    path: 'search', component: SearchResultComponent, pathMatch:'full'
  },
  { 
    path: '**', redirectTo: '', pathMatch:'full'
  },
  {
    path: 'error', redirectTo: '', pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false, useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
