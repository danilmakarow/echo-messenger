import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MessengerComponentsDisplayService {
  readonly chatDisplay$ = new BehaviorSubject<boolean>(true);
  readonly dialogsDisplay$ = new BehaviorSubject<boolean>(true);

  public hideDialogs() {
    this.dialogsDisplay$.next(false)
  }
  public showDialogs() {
    this.dialogsDisplay$.next(true)
  }

  public hideChat() {
    this.chatDisplay$.next(false)
  }
  public showChat() {
    this.chatDisplay$.next(true)
  }
}
