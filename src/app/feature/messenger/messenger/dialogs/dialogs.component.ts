import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {UserDialog} from "../../../user-data.service";
import {DialogTransferService} from "../../../dialog-transfer.service";
import {BehaviorSubject, Observable} from "rxjs";
import {DialogsDataService} from "./dialogs-data.service";
import {message} from "../../../../shared/interfaces/firebase";
import {MatDialog} from "@angular/material/dialog";
import {NewDialogWindowComponent} from "./new-dialog-window/new-dialog-window.component";
import {AuthService} from "../../../../shared/auth/auth.service";

export interface newMessage {
  ref: string,
  mes: Observable<message | undefined>
}

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogsComponent implements OnInit {
  public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);
  public nameFilter: string = '';

  constructor(
      public dialogTrans:DialogTransferService,
      public dialog: MatDialog,
      public auth: AuthService,
      private dialogData: DialogsDataService,
  ) {}

  ngOnInit() {
    this.dialogData.dialogs$.subscribe(dialogs => this.dialogs$.next(dialogs))
  }

  public filterDialogs(search: string): void {
    if(!search.trim()) this.dialogs$.next(this.dialogData.dialogs$.getValue());
    let dialogs = this.dialogs$.getValue();
    dialogs = dialogs?.filter((dialog) =>
        dialog.otherUserName
            .toLowerCase()
            .includes(search.toLowerCase())
    ) || null;
    this.dialogs$.next(dialogs);
  }

  public openDialog(): void {
    const dialogRef = this.dialog.open(NewDialogWindowComponent);
  }
}
