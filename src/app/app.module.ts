import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {AuthModule} from "./shared/auth/auth.module";
import {RouterModule, Routes} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MessengerModule} from "./feature/messenger/messenger.module";
import {UserDataService} from "./feature/user-data.service";
import {DialogTransferService} from "./feature/dialog-transfer.service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DialogsDataService} from "./feature/messenger/messenger/dialogs/dialogs-data.service";
import {ChatDataService} from "./feature/messenger/messenger/chat/chat-data.service";
import {ScreenSizeService} from "./feature/screen-size.service";
import {LayoutModule} from "@angular/cdk/layout";
import {MessengerComponentsDisplayService} from "./feature/messenger/messenger/messenger-components-display.service";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {RouteAccessGuard} from "./shared/auth/guards/route-access.guard";
import {AuthService} from "./shared/auth/auth.service";

const appRoutes: Routes = [
  { path: '', redirectTo: 'auth/phone', pathMatch:'full'},
  { path: 'chat', loadChildren: () => import("./feature/messenger/messenger.module").then(m => m.MessengerModule)},
  { path: 'auth', loadChildren: () => import("./shared/auth/auth.module").then(m => m.AuthModule)},
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MessengerModule,
    BrowserAnimationsModule,
    LayoutModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    UserDataService,
    DialogTransferService,
    DialogsDataService,
    ChatDataService,
    ScreenSizeService,
    MessengerComponentsDisplayService,
    RouteAccessGuard,
    AuthService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
