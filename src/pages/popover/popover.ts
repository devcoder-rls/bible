import { Component } from '@angular/core';
import { App, ViewController } from 'ionic-angular';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { BookmarkListsPage } from '../bookmark-lists/bookmark-lists';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopOverPage {

  constructor(public appCtrl: App, public viewCtrl: ViewController, private deviceFeedback: DeviceFeedback) {
  }

  openBookmarks() {
    this.deviceFeedback.acoustic();

    this.appCtrl.getRootNav().push(BookmarkListsPage);
    this.viewCtrl.dismiss();
  }

  openSettings() {
    this.deviceFeedback.acoustic();

    this.appCtrl.getRootNav().push(SettingsPage);
    this.viewCtrl.dismiss();
  }
}
