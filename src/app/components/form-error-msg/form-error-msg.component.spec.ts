import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorMsgComponent } from './form-error-msg.component';

describe('FormErrorMsgComponent', () => {
  let component: FormErrorMsgComponent;
  let fixture: ComponentFixture<FormErrorMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorMsgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormErrorMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
