import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  ytTextOrURL:string = '';
  showBackButton:boolean = false;

  constructor(private appService:AppServiceService, private router:Router, private location:Location) {
    this.appService.showBackButtonSource.subscribe(val => this.showBackButton = val);
  }

  search() {
    if (this.ytTextOrURL.length > 0) {
      this.router.navigate(['search'], {queryParams: {q: this.ytTextOrURL}});
    }
  }

  populateRecommendedVideos() {
    this.appService.populateRecommendedVideos();
  }

  backToHome() {
    this.location.back();
  }
}
