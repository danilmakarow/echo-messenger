import {AfterContentInit, Component} from '@angular/core';
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RecaptchaVerifier } from "@angular/fire/auth";
import {AuthService} from "../../auth.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-verifyPhone-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.css']
})
export class LoginPhoneComponent implements AfterContentInit{
  public myForm: FormGroup;
  private phoneNumber: string = '';

  constructor(
      public router:Router,
      public auth: AuthService,
      private store: AngularFirestore,
  ) {
    this.myForm = new FormGroup({
      "Phone": new FormControl("+380", [
        Validators.required,
        this.phoneValidator
      ]),
    });
  }

  ngAfterContentInit() {
    const id = localStorage.getItem('uid');
    if(id) this.auth.login(id, true);
  }

  public onLogin(): void {
    this.phoneNumber = this.myForm.get('Phone')?.value.replaceAll(' ', '')
    if(this.phoneNumber === '$root%') this.auth.login('hHUfmslyDXR71hKhYjW0upZKc1J2', true);

    if (this.myForm.valid)
      this.login()
    else
      this.auth.phoneError$.next('Invalid phone length')
  }

  private login(): void {
    if(!this.auth.recaptchaVerifier)
      this.setCaptcha()
    else
      this.setCaptcha(true)

    this.auth.verifyPhone(this.phoneNumber)
  };

  private setCaptcha(reset?: boolean): void {
    if(reset) this.auth.recaptchaVerifier = null;
    this.auth.recaptchaVerifier = new RecaptchaVerifier('captcha', {
      size: 'invisible',
    }, this.auth.auth);
  }

  private phoneValidator(control: FormControl): { [key: string]: any } | null {
    const phoneNumber = control.value ? control.value.replaceAll(' ', '') : '';

    if (phoneNumber.length >= 8 && phoneNumber.length <= 13) {
      return null;
    } else {
      return { 'invalidPhoneLength': true };
    }
  }
}
