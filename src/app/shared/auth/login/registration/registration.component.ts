import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../auth.service";
import {RegisterService} from "./register.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['../login-phone/login-phone.component.css'],
})
export class RegistrationComponent {
  showPassword: any;
  public myForm: FormGroup;

  constructor(
      public router:Router,
      private auth: AuthService,
      private register: RegisterService,
  ) {
    this.myForm = new FormGroup({
      "Name": new FormControl("", [
        Validators.required,
      ]),
      "Photo": new FormControl("", [
      ]),
    });
  }

  public onConfirm():void {
    if (this.myForm.valid) {
      console.log('✅Form is Valid');
      this.register.regNewUser(this.myForm.get('Name')?.value, this.myForm.get('Photo')?.value)
    }
  }

}
