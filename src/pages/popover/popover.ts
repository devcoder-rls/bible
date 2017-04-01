import { Component } from '@angular/core';
import { App, ViewController } from 'ionic-angular';
import { DeviceFeedback } from 'ionic-native';
import { BookmarkListsPage } from '../bookmark-lists/bookmark-lists';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopOverPage {

  constructor(public appCtrl: App, public viewCtrl: ViewController) {
  }

  openBookmarks() {
    DeviceFeedback.acoustic();

    this.appCtrl.getRootNav().push(BookmarkListsPage);
    this.viewCtrl.dismiss();
  }

  openSettings() {
    DeviceFeedback.acoustic();

    this.viewCtrl.dismiss();
  }
}
