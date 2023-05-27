import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import {UserDataService} from "../../../../user-data.service";
import {ChatDataService} from "../chat-data.service";
import {Subject, takeUntil} from "rxjs";
import {message} from "../../../../../shared/interfaces/firebase";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MessageComponent implements AfterViewInit, OnDestroy{
  @Input() public messages: message[] | null = null;
  @ViewChildren('messageRef') private messageItems!: QueryList<ElementRef>;

  public curUserId: string;
  private newChat: boolean = true;

  constructor(
      public userData: UserDataService,
      private chatData: ChatDataService
  ) {
    this.curUserId = this.userData.curUserDoc?.ref.id as string;
  };

  ngAfterViewInit() {
    //Scroll - smooth with new message and fast while chat opens
    this.chatData.chatData$.pipe(takeUntil(this.unsubscribe$)).subscribe(() =>
      this.newChat = true
    )
    this.messageItems.changes.pipe(takeUntil(this.unsubscribe$)).subscribe(() =>
      this.scrollToLastItem()
    );
  };

  private scrollToLastItem(): void {
    //TODO Could be done better
    if (!this.newChat && this.messageItems?.last) {
      this.messageItems.last.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end'});
    }
    if (this.newChat && this.messageItems?.last) {
      this.messageItems.last.nativeElement.scrollIntoView({behavior: 'instant', block: 'end'});
      this.newChat = false;
    }
  };

  private unsubscribe$ = new Subject<void>();
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  };
}
