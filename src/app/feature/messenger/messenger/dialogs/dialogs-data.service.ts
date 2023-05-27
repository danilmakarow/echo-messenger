import {Injectable, OnDestroy} from '@angular/core';
import {
    from,
    Observable,
    switchMap,
    map,
    forkJoin,
    BehaviorSubject,
    filter, tap, takeUntil, skip, Subject
} from "rxjs";
import {UserDataService, UserDialog} from "../../../user-data.service";
import {AngularFirestore, DocumentSnapshot} from "@angular/fire/compat/firestore";
import {DocumentReference} from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat';
import {chat, UserDB, message} from "../../../../shared/interfaces/firebase";
import {ScreenSizeService} from "../../../screen-size.service";
import {arrayUnion, updateDoc} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})

export class DialogsDataService implements OnDestroy{
  public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);
  public otherUserIds: string[] = [];

  constructor(
      private store: AngularFirestore,
      private userData: UserDataService,
      private screenSize: ScreenSizeService
  ) {
    //TODO Could be done better way
    //Sub to changes in current user
    userData.curUserData$
        .pipe(
            filter(user => !!user?.dialogs[0]),
            tap(user => {
                if(user) this.createUsersList(user.dialogs);
            }),
            switchMap(user => {
              const dialogObservables = user?.dialogs.map(this.getDialogAndOtherUser);
              return forkJoin(dialogObservables || []);
            }),
            map(dialogs => this.sortDialogs(dialogs)),
            tap(dialogs => this.dialogs$.next(dialogs)),
        ).subscribe(
            dialogs => {
                dialogs.forEach(dialog => this.dialogSubscription(dialog))
            }
        );
  }

  public createChat(user1: string, user2: string): Observable<DocumentReference<chat>> {
      const [userDoc1, userDoc2] = [this.store.doc<UserDB>(`users/${user1}`), this.store.doc<UserDB>(`users/${user2}`)];
      const dialogsData = {
          message: [],
          users: [
              userDoc1.ref,
              userDoc2.ref
          ]
      };
      return from(this.store.collection<chat>('chats').add(dialogsData)).pipe(
          tap(chatRef => {
              updateDoc( userDoc1.ref, {dialogs: arrayUnion(chatRef)})
              updateDoc( userDoc2.ref, {dialogs: arrayUnion(chatRef)})
          })
      )
  };

  public createUsersList(dialogs: DocumentReference<chat>[]): void {
      dialogs.forEach(el => {
          from(el.get()).subscribe(
              data => this.otherUserIds.push(this.userData.getOtherUser(data.data()?.users as DocumentReference<UserDB>[]).id)
          );
      })
  }

  ////////////////// Getting and transforming dialogs for Dialogs Component //////////////////
  // Func to get data about other user from dialog
  public getOtherUserData = (users: DocumentReference<UserDB>[]): Observable<DocumentSnapshot<UserDB>> => {
    const otherUser = this.userData.getOtherUser(users);
    // @ts-ignore
    return from(otherUser.get());
  };

  // Fixes message's length to fit left sidebar
  private messageLengthFix(message: message): message {
      const length = this.screenSize.isMobile$.getValue() ? 45 : 50;
      if(message.content.length > length) message.content = message.content.slice(0, length) + '...';
      return message;
  }

  // Craft UserDialog object for dialogs component
  private createUserDialog = (dialogData: firebase.firestore.DocumentSnapshot<chat>, otherUserData: DocumentSnapshot<UserDB>): UserDialog => {
      const lastMessage = dialogData.data()?.message.slice(-1)[0] as message;
      if (lastMessage) this.messageLengthFix(lastMessage);
      return {
          ref: dialogData.ref,
          lastMessageValue: lastMessage?.content,
          lastMessageTime: lastMessage?.time,
          otherUserName: otherUserData.data()?.name as string,
          otherUserPhoto: otherUserData.data()?.photo as string
      };
  };

  // Get dialog & users data from DB and pass it on
  private getDialogAndOtherUser = (dialog: DocumentReference<chat>): Observable<UserDialog> => {
    return from(dialog.get()).pipe(
      switchMap((dialogData) => {
          return this.getOtherUserData(dialogData.data()?.users as DocumentReference<UserDB>[]).pipe(
            map(otherUserData => this.createUserDialog(dialogData, otherUserData))
          )
        })
    );
  };

  // Sorting dialog by date
  private sortDialogs(dialogs: UserDialog[]): UserDialog[] {
    return dialogs.sort((a, b) => new Date(b.lastMessageTime as string).getTime() - new Date(a.lastMessageTime as string).getTime());
  }

 ////////////////// Listening for changes in dialogs and modifying them //////////////////
 // Sub to changes to each dialog
 private dialogSubscription(dialog: UserDialog): void {
      this.store.doc<chat>(`chats/${dialog.ref.id}`).valueChanges()
          .pipe(
              takeUntil(this.unsubscribe$),
              skip(1),
          ).subscribe(newDialog => this.createDialogUpdate(dialog, newDialog as chat));
 }

 // Takes old dialog, sends it for modifying func and sends it to elevator func
 private createDialogUpdate(dialog: UserDialog, newDialog:chat): void {
     let dialogEl = this.dialogs$.getValue()?.find(dialogEl => dialogEl === dialog)
     dialogEl = this.changeDialog(dialogEl as UserDialog, newDialog)
     this.dialogToTop(dialogEl)
 }

 // Cuts dialog from dialogs array and puts it on top
 private dialogToTop(dialog: UserDialog): void {
     const dialogs = this.dialogs$.getValue()
     dialogs?.splice(dialogs?.findIndex(el => el.ref.id === dialog.ref.id), 1);
     dialogs?.unshift(dialog);
     this.dialogs$.next(dialogs)
 }

 // Takes last message from updated dialog and modifies old one
 private changeDialog(oldDialog: UserDialog, updatedDialog: chat): UserDialog {
     const lastMessage = updatedDialog.message.slice(-1)[0];
     this.messageLengthFix(lastMessage);
     oldDialog.lastMessageValue = lastMessage?.content;
     oldDialog.lastMessageTime = lastMessage?.time;
     return oldDialog
 }

 private unsubscribe$ = new Subject<void>();
   ngOnDestroy() {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
  }
}
