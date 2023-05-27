import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessengerComponent } from './messenger/messenger.component';
import { DialogsComponent } from './messenger/dialogs/dialogs.component';
import { DialogComponent } from './messenger/dialogs/dialog/dialog.component';
import { ChatComponent } from './messenger/chat/chat.component';
import { MessageComponent } from './messenger/chat/message/message.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RouterModule, Routes} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";
import {LayoutModule} from "@angular/cdk/layout";
import {RouteAccessGuard} from "../../shared/auth/guards/route-access.guard";
import { NewDialogWindowComponent } from './messenger/dialogs/new-dialog-window/new-dialog-window.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

const chatRoutes: Routes = [
    {path: 'chat',
        component: MessengerComponent,
        children: [{ path: ':id', component: ChatComponent}],
        canActivate: [RouteAccessGuard]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(chatRoutes),
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        LayoutModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        MessengerComponent,
        DialogsComponent,
        DialogComponent,
        ChatComponent,
        MessageComponent,
        NewDialogWindowComponent,
    ],
    exports: [
        MessengerComponent,
    ],
})
export class MessengerModule { }
