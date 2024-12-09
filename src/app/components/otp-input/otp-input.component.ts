import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [NgOtpInputModule],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.css',
})
export class OtpInputComponent {
  config = {
    length: 6,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'otp-input-style',
  };

  @Output() otp: EventEmitter<any> = new EventEmitter();
  @Output() length: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.length.emit(this.config.length);
  }

  onOtpChange(otp) {
    this.otp.emit(otp);
  }

}
