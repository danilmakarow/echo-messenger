import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {ScreenSizeService} from "../../screen-size.service";
import {MessengerComponentsDisplayService} from "./messenger-components-display.service";
import {DialogsDataService} from "./dialogs/dialogs-data.service";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent {
  public sidenav : boolean = true;
  constructor(
      public componentsDisplay: MessengerComponentsDisplayService,
      public screenSize: ScreenSizeService,
      private router: Router,
      private dialogData: DialogsDataService,
      ) {
    router.navigateByUrl('chat')
  }
}
