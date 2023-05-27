import { Injectable } from '@angular/core';
import {DialogTransferService} from "../../../dialog-transfer.service";
import {BehaviorSubject, filter, from, map, Observable, switchMap, tap} from "rxjs";
import {UserDialog, UserDataService} from "../../../user-data.service";
import {Action, AngularFirestore, DocumentReference, DocumentSnapshot} from "@angular/fire/compat/firestore";
import {arrayRemove, arrayUnion, updateDoc} from "@angular/fire/firestore";
import {chat, message, UserDB} from "../../../../shared/interfaces/firebase";

export interface ChatData {
  name: string,
  photo: string,
  ref: DocumentReference<chat>
}

export interface messageDB {
  content: string,
  senderId: DocumentReference,
  time: string
}

export interface chatData {
  currentChat: DocumentReference<chat>,
  senderId: DocumentReference<UserDB>,
  messages: string[]
}

@Injectable({
  providedIn: 'root'
})

export class ChatDataService {
  public chatData$ = new BehaviorSubject<ChatData | null>(null);
  public messagesData$ = new BehaviorSubject<message[] | null>(null);

  constructor(
      private userData: UserDataService,
      private dialogTrans: DialogTransferService,
      private store: AngularFirestore,
  ) {
    //Subscription to changes in opened Dialog
    dialogTrans.dialog$.pipe(
        filter(Boolean),
        switchMap((dialog: UserDialog) => this.getMessagesData(dialog)),

        filter(data => (data.payload.data()?.message.length as number) > (this.messagesData$.getValue()?.length as number)),
        filter(dialog => dialog.type === 'modified'),

        map(data => data.payload.data()?.message),
    ).subscribe(messages =>
        this.messagesData$.next(messages as message[])
    )
  }

  public onSendMessage(messageEl: HTMLTextAreaElement): void {
    const message = messageEl.value.trim();
    if (!message) return;

    messageEl.value = '';
    this.messageHeightCalc(messageEl);

    this.sendMessageToDB(
      this.chatData$.getValue()?.ref as DocumentReference<chat>,
      this.createMessageForDB(message)
    )
  }

  public messageHeightCalc(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // Resetting height
    textarea.style.height = textarea.scrollHeight - 22 + 'px'; // Setting new height based on content height
  }

  public deleteChat(): void {
    const chatToDelete = this.dialogTrans.dialog$.getValue()?.ref;
    if(!chatToDelete) return
    from(chatToDelete.get()).subscribe(
        chatData => chatData.data()?.users.forEach(
            user => {
              updateDoc(
                  user,
                  { dialogs: arrayRemove(chatToDelete) }
              );
              chatToDelete.delete()
            }
        )
    )
  }

  private createMessageForDB(message: string, user: DocumentReference = this.userData.curUserDoc?.ref): messageDB {
    return {
      content: message,
      senderId: user,
      time: new Date().toISOString()
    }
  }

  private getMessagesData(dialog: UserDialog): Observable<Action<DocumentSnapshot<chat>>> {
    from(dialog.ref.get()).subscribe(chat =>
      this.setNewUserAndMessages(dialog.otherUserName, dialog.otherUserPhoto, dialog.ref, chat.data()?.message as message[])
    )
    return this.store.doc<chat>(`chats/${dialog.ref.id}`).snapshotChanges()
  }

  private setNewUserAndMessages(name: string, photo: string, ref: DocumentReference<chat>, messages: message[]): void {
    this.chatData$.next({name, photo, ref})
    this.messagesData$.next(messages)
  }

  private sendMessageToDB(chat: DocumentReference<chat>, message: messageDB): void {
    updateDoc(
      chat,
      {message: arrayUnion(message)}
    )
  }
}
