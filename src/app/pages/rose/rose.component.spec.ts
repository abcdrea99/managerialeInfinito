import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoseComponent } from './rose.component';

describe('RoseComponent', () => {
  let component: RoseComponent;
  let fixture: ComponentFixture<RoseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain seasons', () => {
    expect(component.seasons.length).toBeGreaterThan(0);
  });

  it('should have a selected season', () => {
    expect(component.selectedSeason).toBeTruthy();
  });

  it('should return current season', () => {
    expect(component.currentSeason).toBeTruthy();
  });
});
