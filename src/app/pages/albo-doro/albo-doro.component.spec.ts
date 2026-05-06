import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlboDoroComponent } from './albo-doro.component';

describe('AlboDoroComponent', () => {
  let component: AlboDoroComponent;
  let fixture: ComponentFixture<AlboDoroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlboDoroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlboDoroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
