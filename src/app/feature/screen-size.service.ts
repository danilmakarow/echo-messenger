import { Injectable } from '@angular/core';
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {BehaviorSubject, map, Observable} from "rxjs";
import {MessengerComponentsDisplayService} from "./messenger/messenger/messenger-components-display.service";

@Injectable({
  providedIn: 'root'
})

export class ScreenSizeService {
  public isTablet$ = new BehaviorSubject<boolean>(false);
  public isMobile$ = new BehaviorSubject<boolean>(false);

  constructor(
      private breakpointObserver: BreakpointObserver,
      private componentsDisplay: MessengerComponentsDisplayService) {
      const [mobileSize, tabletSize] = ['(max-width: 500px)', '(max-width: 850px)'];
      this.breakpointObserver.observe([mobileSize, tabletSize])
          .pipe(
              map(data => {return {
                  mobile: data.breakpoints[mobileSize],
                  tablet: data.breakpoints[tabletSize]
              }})
          )
          .subscribe(screenData => {
          if (screenData.tablet !== this.isTablet$.getValue()) {
              this.onTabletSize(screenData.tablet);
          }
          if (screenData.mobile !== this.isMobile$.getValue()) {
              this.onMobileSize(screenData.mobile);
          }
          if(!screenData.tablet && !screenData.mobile) {
              this.onPcSize()
          }
      });
  }

  private onTabletSize(status: boolean): void {
      this.isTablet$.next(status);
  }
  private onMobileSize(status: boolean): void {
      this.isMobile$.next(status);
      if(this.componentsDisplay.dialogsDisplay$.getValue()) this.componentsDisplay.hideChat()
      if(!status) this.componentsDisplay.showChat()
  }
  private onPcSize(): void {
      const displayService = this.componentsDisplay;
      if(displayService.chatDisplay$.getValue() || !displayService.dialogsDisplay$.getValue()) {
          displayService.showDialogs();
          displayService.showChat();
      }
  }
}
