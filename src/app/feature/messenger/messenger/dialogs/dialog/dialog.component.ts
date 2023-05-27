import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {UserDialog} from "../../../../user-data.service";
import {BehaviorSubject} from "rxjs";
import {ScreenSizeService} from "../../../../screen-size.service";
import {MessengerComponentsDisplayService} from "../../messenger-components-display.service";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogComponent implements AfterViewChecked{
  @Input() public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);
  @Output() selectedDialog = new EventEmitter<UserDialog>();

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.selected?.classList.remove('selected');
    this.selected = null;
  };

  constructor(
      public screensSize: ScreenSizeService,
      public componentsDisplay: MessengerComponentsDisplayService,
  ) {
  }

  selected: HTMLElement | null = null;

  //TODO Refactor this to identify opened dialog by its ID, not element
  public onclick(doc: UserDialog, element: any): void{
    if (this.selected) this.selected.classList.remove('selected');
    element.classList.add('selected');
    this.selected = element;
    this.selectedDialog.emit(doc);

    if(this.screensSize.isTablet$.getValue())this.componentsDisplay.hideDialogs();
    if(this.screensSize.isMobile$.getValue())this.componentsDisplay.showChat();
  }

  ngAfterViewChecked() {
    if(this.selected && !this.selected.classList.contains('selected')) this.selected.classList.add('selected')
  }
}
