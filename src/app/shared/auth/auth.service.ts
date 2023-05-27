import { Injectable } from '@angular/core';
import {Auth, getAuth, PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber, User} from "@firebase/auth";
import {BehaviorSubject, catchError, filter, from, of, Subject, switchMap, takeUntil, tap, throwError} from "rxjs";
import {Router} from "@angular/router";
import {RecaptchaVerifier} from "@angular/fire/auth";
import {UserDataService} from "../../feature/user-data.service";
import firebase from "firebase/compat";
import FirebaseError = firebase.FirebaseError;
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public userLoggedIn: boolean = false;
  public phoneCodeAccess: boolean = false;

  public phoneError$ = new BehaviorSubject<null | string>(null)
  public codeError$ = new BehaviorSubject<null | string>(null)

  public auth: Auth = getAuth();
  public recaptchaVerifier: RecaptchaVerifier | null = null;
  public userInfo!: User;
  private verificationId!: string;

  constructor(
      private router: Router,
      private userData: UserDataService,
      private store: AngularFirestore,
  ) {

  }

  // Checks reCaptcha and sends verification code
  public verifyPhone(phone: string):void {
      from(signInWithPhoneNumber(this.auth, phone, this.recaptchaVerifier as RecaptchaVerifier)).pipe(
          catchError(error => {
              this.sendErrorMessage(this.phoneError$, error)
              return of(null)
          }),
          filter(Boolean),
          tap(() => {
              if(this.phoneError$.getValue())this.phoneError$.next(null)
              this.phoneCodeAccess = true;
          }),
      ).subscribe(
          loginData => {
              this.verificationId = loginData.verificationId;
              this.router.navigateByUrl('auth/code')
          }
      )
  }

  //Checks verification code and New Users
  public verifyCode(code:string):void {
    const credentials = PhoneAuthProvider.credential(this.verificationId, code);
    from(signInWithCredential(this.auth, credentials))
        .pipe(
            takeUntil(this.unsubscribe$),
            catchError(error => {
                this.sendErrorMessage(this.codeError$, error);
                return of(null);
            }),
            filter(Boolean),
            tap(() => {
                this.userLoggedIn = true;
                this.phoneCodeAccess = false;
                if (this.phoneError$.getValue()) this.codeError$.next(null);
            }),
        ).subscribe(
        (loginData) => {
            this.userInfo = loginData.user;
            this.store.doc(`users/${loginData.user.uid}`)
                .get()
                .pipe(
                    takeUntil(this.unsubscribe$)
                )
                .subscribe(user => {
                    // @ts-ignore
                    if(loginData._tokenResponse.isNewUser || !user.exists)
                        this.router.navigateByUrl('auth/registration');
                    else
                        this.login(loginData.user.uid, false)
                })
        }
    )
  }

  public logout():void {
      this.unsubscribe$.next()
      this.userLoggedIn = false;
      localStorage.removeItem('uid')
      this.router.navigateByUrl('auth/phone');
  }

  public login(id: string, autoLogin?: boolean): void {
      if(autoLogin) {
          this.userLoggedIn = true;
          this.phoneCodeAccess = false;
      } else {
          localStorage.setItem('uid', id);
      }
      this.userData.setCurrentUser(id);
      this.router.navigateByUrl('chat/');
  }

  private sendErrorMessage(sendto: BehaviorSubject<null | string>, error: FirebaseError):void {
      let message = error.message
          .slice(error.message.indexOf('/') + 1, -2)
          .toLowerCase()
          .replaceAll('-', ' ');
      sendto.next(message);
  }

  private unsubscribe$ = new Subject<void>();
  ngOnDestroy() {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
  }
}
