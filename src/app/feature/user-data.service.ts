import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import DocumentReference = firebase.firestore.DocumentReference;
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {chat, UserDB} from "../shared/interfaces/firebase";

// Interfaces to export to components //
export interface UserDialog {
  ref: DocumentReference<chat>,
  otherUserName: string,
  otherUserPhoto: string,
  lastMessageTime: string | undefined,
  lastMessageValue: string | undefined,
}

@Injectable({
  providedIn: 'root'
})

export class UserDataService {
  public curUserDoc!: AngularFirestoreDocument<UserDB>;
  public curUserData$ = new BehaviorSubject<UserDB | null>(null);
  private unsubscribe$ = new Subject<void>();

  constructor(private store: AngularFirestore) {
    // this.setCurrentUser('q5upY7eciFPDGQLrlSzS3WzYPQ12')
  }

  // Func calls when Current User changes
  public setCurrentUser(user: string):void {
    this.unsubscribe$.next();
    this.curUserDoc = this.store.doc(`users/${user}`);
    this.curUserDoc.valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(
        user => this.curUserData$.next(user as UserDB)
    );
  };

  public getOtherUser = (otherUserId: firebase.firestore.DocumentReference<UserDB>[]): firebase.firestore.DocumentReference<UserDB> => {
    return otherUserId[0].id === this.curUserDoc.ref.id ? otherUserId[1] : otherUserId[0]
  }
}
