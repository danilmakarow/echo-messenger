import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { LoginCodeComponent } from './login/login-code/login-code.component';
import { LoginPhoneComponent } from './login/login-phone/login-phone.component';

import { CommonModule } from '@angular/common';
import {RouterModule, RouterOutlet, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {AngularFireModule} from "@angular/fire/compat";
import {PhoneCodeGuard} from "./guards/phone-code.guard";
import { RegistrationComponent } from './login/registration/registration.component';
import {RouteAccessGuard} from "./guards/route-access.guard";
import {RegisterService} from "./login/registration/register.service";

const authRoutes: Routes = [
  { path: 'auth', redirectTo: 'auth/phone', pathMatch: 'full'},
  { path: 'auth', component: LoginComponent, children: [
      { path: 'phone', component: LoginPhoneComponent},
      { path: 'code', component: LoginCodeComponent, canActivate: [PhoneCodeGuard]},
      { path: 'registration', component: RegistrationComponent, canActivate: [RouteAccessGuard]},
    ]
  },
];

@NgModule({
  imports: [
    AngularFireModule,
    RouterModule.forChild(authRoutes),
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    AngularFireDatabaseModule,
  ],
  declarations: [
    LoginComponent,
    LoginCodeComponent,
    LoginPhoneComponent,
    RegistrationComponent,
  ],
  providers: [
    RegisterService,
  ],
  exports: [
    LoginComponent,
  ],
})
export class AuthModule { }
