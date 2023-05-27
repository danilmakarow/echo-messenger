import { Injectable } from '@angular/core';
import {AngularFirestore, DocumentReference} from "@angular/fire/compat/firestore";
import {AuthService} from "../../auth.service";
import {Router} from "@angular/router";
import {UserDataService} from "../../../../feature/user-data.service";
import {chat, UserDB} from "../../../interfaces/firebase";
import {arrayUnion, updateDoc} from "@angular/fire/firestore";
import {DialogsDataService} from "../../../../feature/messenger/messenger/dialogs/dialogs-data.service";

@Injectable({
  providedIn: 'root'
})

export class RegisterService {
  constructor(
      private store: AngularFirestore,
      private auth: AuthService,
      private router: Router,
      private userData: UserDataService,
      private dialogData: DialogsDataService
  ) { };

  public regNewUser(name:string, photo:string): void {
    this.store.doc(`users/${this.auth.userInfo.uid}`).set(this.getUserData(name, photo));
    this.store.doc(`phones/${this.auth.userInfo.phoneNumber}`).set({id: this.auth.userInfo.uid});

    this.dialogData.createChat(this.auth.userInfo.uid, 'echo').subscribe(chat => this.sendHello(chat));

    this.userData.setCurrentUser(this.auth.userInfo.uid);
    localStorage.setItem('uid', this.auth.userInfo.uid);
    this.router.navigateByUrl('chat');
  }

  private getUserData(name:string, photo:string): UserDB {
    return {
      name,
      photo: photo ? photo : 'https://agile.yakubovsky.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
      number: this.auth.userInfo.phoneNumber as string,
      dialogs: []
    }
  }

  private sendHello(chat: DocumentReference<chat>): void {
    const echo = this.store.doc<UserDB>(`users/echo`).ref;

    const messages = [
      'Hi👋',
      'Welcome to Echo!',
      'These messages are sent automatically to new users. From here, you can build new connections and chat with friends and co-workers.\n' +
      'To start a new chat, click on the three dots at the top left corner of the page.',
      'Also you can reach me here. Here is my number:\n' +
      '+380675024264'
    ];

    setTimeout(() => {
      updateDoc(
          chat,
          {message: arrayUnion(this.createMessage(echo, messages[0]))})
    }, 3000)

    setTimeout(() => {
      updateDoc(
          chat,
          {message: arrayUnion(this.createMessage(echo, messages[1]))})
    }, 6000)

    setTimeout(() => {
      updateDoc(
          chat,
          {message: arrayUnion(this.createMessage(echo, messages[2]))})
    }, 10000)

    setTimeout(() => {
      updateDoc(
          chat,
          {message: arrayUnion(this.createMessage(echo, messages[3]))})
    }, 13000)

  }

  private createMessage(echo: DocumentReference<UserDB>, mes: string): any {
    return {
      content: mes,
      senderId: echo,
      time: new Date().toISOString(),
    }
  }
}

