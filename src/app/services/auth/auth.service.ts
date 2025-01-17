import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  lastValueFrom,
  Observable,
} from 'rxjs';
import { ApiService } from '../api/api.service';
import { ProfileService } from '../profile/profile.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private tokenKey = 'auth_token';
  // private userProfileKey = 'user_profile';
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  private api = inject(ApiService);
  private profile = inject(ProfileService);
  private toastService = inject(ToastService);

  private currentUserSubject: BehaviorSubject<any>;
  get currentUser() {
    return this.currentUserSubject.asObservable();
  }

  constructor(private http: HttpClient, private router: Router) {}
    
  /**
   * Login the user and store the token.
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const data = {
        email,
        password,
      };
      const response = await lastValueFrom(this.api.post('user/login', data));
      console.log('User type: ', response.data.user.type);
      if (response.data.user.type == 2 || response.data.user.type == 3 || !response.data.user.type) {
        alert('You are not authorized');
        return;
      }
      console.log('user logged in :', response);
      this.storeToken(response.data.token);
      this.updateProfileData(response.data.user);
      this.authStatus.next(true);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async sendResetPasswordOtp(email: string) {
    try {
      const data = { email };
      const response = await lastValueFrom(this.api.patch('user/send/reset/password/token', data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }

  async verifyResetPasswordOtp(email: string, otp: string) {
    try {
      const data = { 
        email,
        otp: otp 
      };
      const response = await lastValueFrom(this.api.patch('user/verify/resetPasswordToken', data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }

  async resetPassword(data) {
    try {
      const reset_pwd_data = {
        email: data.email,
        password: data.new_password
      }
      const response = await lastValueFrom(this.api.patch('user/reset/password', reset_pwd_data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }

  /**
   * Register the user and automatically log them in.
   */
  // register(name: string, email: string, password: string): Observable<any> {
  //   return this.http
  //     .post<any>(`${this.apiUrl}/admin/register`, { name, email, password })
  //     .pipe(
  //       tap((response) => {
  //         this.storeToken(response.token);
  //         this.authStatus.next(true);
  //       })
  //     );
  // }

  /**
   * Check if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Get the stored token.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store the token in localStorage.
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }


  updateProfileData(data) {
    this.profile.updateProfileData(data);
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  logoutUser(msg?) {
    localStorage.removeItem(this.tokenKey);
    // localStorage.removeItem(this.userProfileKey);
    this.authStatus.next(false);
    this.profile.updateProfileData(null);
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    // error?.error ? alert(error?.error.message) : 'Please Login Again';
    this.showToast(msg ? msg : 'Something went wront. Please Log in Again', 'error');
  }

  async logout() {
    try {
      await lastValueFrom(this.api.get('logout'));
      this.logoutUser('You Logged Out!');
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async autoLoginGuard(): Promise<boolean> {
    try {
      if (this.isAuthenticated()) {
        this.router.navigateByUrl('/products/list', { replaceUrl: true });
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return true;
    }
  }

  async authGuard(): Promise<Boolean> {
    console.log('isAuthenticated: ', this.isAuthenticated());
    if (this.isAuthenticated()) {
    // if (!this.currentUserSubject.value) {
    //   this.getUserProfile();
    // }
      return true;
    }
    console.log('n est pas authentifié');
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    return false;
  }

  showToast(msg, type) {
    this.toastService.showToast({
      message: msg,
      type: type,
      duration: 5000,
      position: 'top'
    });
  }

}
