import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {UserDialog} from "./user-data.service";

@Injectable({
  providedIn: 'root'
})
export class DialogTransferService {
  dialog$ = new BehaviorSubject<UserDialog | null>(null);
}
