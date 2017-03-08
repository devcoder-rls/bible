import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { DeviceFeedback } from 'ionic-native';
import { BookmarksPage } from '../bookmarks/bookmarks';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopOverPage {

  constructor(public navCtrl: NavController, public viewCtrl: ViewController) {
  }

  openBookmarks() {
    DeviceFeedback.acoustic();

    this.navCtrl.push(BookmarksPage);
    this.viewCtrl.dismiss();
  }

  openSettings() {
    DeviceFeedback.acoustic();

    this.viewCtrl.dismiss();
  }
}
