import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayShortsComponent } from './play-shorts.component';

describe('PlayShortsComponent', () => {
  let component: PlayShortsComponent;
  let fixture: ComponentFixture<PlayShortsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayShortsComponent]
    });
    fixture = TestBed.createComponent(PlayShortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
