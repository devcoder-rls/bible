import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { InAppBrowser, DeviceFeedback } from 'ionic-native';

@Component({
  selector: 'page-interaction-more',
  templateUrl: 'interaction-more.html'
})
export class InteractionMorePage {

  category: string = "explanation";

  constructor(public navCtrl: NavController, public viewCtrl: ViewController) {
  }

  openUrl(url) {
    DeviceFeedback.haptic(0);

    new InAppBrowser(url, '_system');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
