import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AngularFirestore, DocumentSnapshot} from "@angular/fire/compat/firestore";
import {BehaviorSubject, filter} from "rxjs";
import {DialogsDataService} from "../dialogs-data.service";
import {UserDataService} from "../../../../user-data.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

interface userPhoneDB {
    id: string
}

@Component({
  selector: 'app-new-dialog-window',
  templateUrl: './new-dialog-window.component.html',
  styleUrls: ['./new-dialog-window.component.css']
})

export class NewDialogWindowComponent {
    public myForm: FormGroup;
    public error$ = new BehaviorSubject<string | null>(null);

    constructor(
        public dialogRef: MatDialogRef<NewDialogWindowComponent>,
        private store: AngularFirestore,
        private dialogData: DialogsDataService,
        private userData: UserDataService,
    ) {
        this.myForm = new FormGroup({
            "Phone": new FormControl("+380", [
                Validators.pattern(/^\+\d{8,12}$/)
            ]),
        });
    }

    public onCancel():void {
        this.dialogRef.close();
    }

    public onStart():void {
        const number = this.myForm.get('Phone')?.value;
        if(this.myForm.valid)
            this.store.doc<userPhoneDB>(`phones/${number}`).get()
                .pipe(
                    filter((user: any) => this.checkOnErrors(user, number))
                )
                .subscribe(user => {
                    this.createChat(user.data()?.id as string)
                });
        else
            this.error$.next('Invalid number.')
    }

    private checkOnErrors(user: DocumentSnapshot<userPhoneDB>, number: string): boolean {
        if(!user.exists){
            this.error$.next('User with this number does not exist')
            return false;
        }
        if(this.dialogData.otherUserIds.includes(user.data()?.id as string)){
            this.error$.next('You have dialog with this user')
            return false;
        }
        if(this.userData.curUserData$.getValue()?.number === number){
            this.error$.next('You cant start dialog with yourself')
            return false;
        }
        return true;
    }

    private createChat(id: string):void  {
        this.dialogRef.close();
        this.dialogData.createChat(id, this.userData.curUserDoc.ref.id).subscribe();
        this.error$.next(null)
    }
}
