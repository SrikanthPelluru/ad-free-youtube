import { Component } from '@angular/core';
import { AppServiceService } from 'src/app/service/app-service.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {

  isLoading:boolean = false;

  constructor(private appService:AppServiceService) {
    this.appService.isLoadingSource.subscribe((isLoading) => this.isLoading = isLoading);
  }
}
