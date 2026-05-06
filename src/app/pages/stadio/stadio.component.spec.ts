import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadioComponent } from './stadio.component';

describe('StadioComponent', () => {
  let component: StadioComponent;
  let fixture: ComponentFixture<StadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
