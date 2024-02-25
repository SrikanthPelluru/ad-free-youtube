import { AsyncPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { AppServiceService } from 'src/app/service/app-service.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  ytTextOrURL:string = '';
  showBackButton:boolean = false;
  suggestions:string[] = [];
  
  constructor(private appService:AppServiceService, private router:Router, private location:Location) {
    this.appService.showBackButtonSource.subscribe(val => this.showBackButton = val);
    this.appService.updateSearchText.subscribe(val => this.ytTextOrURL = val);
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.provideSuggestions())
    );
  }

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  private _filter(value: any): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  search() {
    if (this.ytTextOrURL.length > 0) {
      this.appService.updateSearchText.next(this.ytTextOrURL);
      this.router.navigate(['search'], {queryParams: {q: this.ytTextOrURL}});
    }
  }

  populateRecommendedVideos() {
    this.appService.populateRecommendedVideos();
  }

  backToHome() {
    this.location.back();
  }

  provideSuggestions() : string[] {
    this.appService.getSuggestions(this.ytTextOrURL).subscribe(res => this.suggestions = res);
    return this.suggestions;
  }
}
