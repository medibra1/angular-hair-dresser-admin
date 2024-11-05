import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgOtpInputModule } from 'ng-otp-input';
import { BehaviorSubject, interval, map, Subscription, takeWhile, timer } from 'rxjs';
import { GlobalService } from '../../services/global/global.service';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule, NgOtpInputModule],
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
