import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsSettingsComponent } from './appointments-settings.component';

describe('AppointmentsSettingsComponent', () => {
  let component: AppointmentsSettingsComponent;
  let fixture: ComponentFixture<AppointmentsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
