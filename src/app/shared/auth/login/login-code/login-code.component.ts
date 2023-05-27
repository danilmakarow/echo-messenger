import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-signin',
  templateUrl: './login-code.component.html',
  styleUrls: ['../login-phone/login-phone.component.css'],
})
export class LoginCodeComponent {
  public myForm: FormGroup

  constructor(
    public router:Router,
    public auth: AuthService,
  ) {
    this.myForm = new FormGroup({
      "Code": new FormControl("", [
        Validators.pattern(/^\d{6}$/)
      ]),
    });
  }

  public confirmCode(): void {
    this.auth.verifyCode(this.myForm.get('Code')?.value)
  }

  public onPhoneCode(): void {
    if (this.myForm.valid) {
      this.confirmCode()
    } else console.log(`⛔ Code error: `,this.myForm.controls)
  }
}
