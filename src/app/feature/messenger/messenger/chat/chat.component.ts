import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {Router} from "@angular/router";
import {BehaviorSubject, filter, Observable, tap} from 'rxjs';
import {ChatDataService} from "./chat-data.service";
import {DocumentReference} from "@angular/fire/compat/firestore";
import {message} from "../../../../shared/interfaces/firebase";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {ScreenSizeService} from "../../../screen-size.service";
import {MessengerComponentsDisplayService} from "../messenger-components-display.service";
import {DialogTransferService} from "../../../dialog-transfer.service";

export interface User {
  name: string,
  photo: string,
  dialogs?: DocumentReference<message>[]
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('message', {static: false}) private messageInput!: ElementRef;

  @HostListener('document:keydown.escape', ['$event'])
  private handleEscapeKey(): void {
    this.router.navigateByUrl('chat') //Close component on Escape
    if(!this.componentsDisplay.dialogsDisplay$.getValue()) this.componentsDisplay.showDialogs()
  };

  @HostListener('document:keydown.enter', ['$event'])
  private handleEnterKey(): void {
    this.chatData.onSendMessage(this.messageInput.nativeElement)//Send message on Enter
  }

  public messages$ = new BehaviorSubject<message[]>([]);
  public user$ = new BehaviorSubject<User>({
    name: 'Loading',
    photo: ''
  });

  constructor(
      public chatData: ChatDataService,
      public screenSize: ScreenSizeService,
      public componentsDisplay: MessengerComponentsDisplayService,
      private dialogTrans: DialogTransferService,
      private router: Router,
  ) {}

  ngOnInit() {
    //Subscriptions on changes in messages and dialogs
    this.chatData.chatData$.pipe(
      filter(Boolean),
      tap(messages => this.user$.next(messages))
    ).subscribe();

    this.chatData.messagesData$.pipe(
      filter(Boolean),
      tap(messages => this.messages$.next(messages))
    ).subscribe();
  }

  ngAfterViewChecked() {
    if(!this.screenSize.isTablet$) this.messageInput.nativeElement.focus();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey)
      event.preventDefault();
  }

  public onHideDialogs(): void {
    this.componentsDisplay.hideDialogs();
  }

  public onShowDialogs(): void {
    this.componentsDisplay.showDialogs();
    if(this.screenSize.isMobile$.getValue())this.componentsDisplay.hideChat();
  }

  public onChatClick(): void {
    if(this.screenSize.isTablet$.getValue() && this.componentsDisplay.dialogsDisplay$.getValue())
      this.componentsDisplay.hideDialogs();
  }

  public onDeleteChat(): void {
    this.router.navigateByUrl('/chat')
    this.chatData.deleteChat()
  }
}
