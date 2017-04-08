import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';

@Component({
  selector: 'page-interaction-more',
  templateUrl: 'interaction-more.html'
})
export class InteractionMorePage {

  category: string = "explanation";

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public inappbrowser: InAppBrowser, private deviceFeedback: DeviceFeedback) {
  }

  openUrl(url) {
    this.deviceFeedback.haptic(0);

    this.inappbrowser.create(url, '_system');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
