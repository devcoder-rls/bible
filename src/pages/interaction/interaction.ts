import { Component } from '@angular/core';
import { NavController, ViewController, ModalController, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { InteractionMorePage } from '../interaction-more/interaction-more';

@Component({
  selector: 'page-interaction',
  templateUrl: 'interaction.html'
})
export class InteractionPage {

  slidesPerView: number;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public modalCtrl: ModalController, public plt: Platform , public inappbrowser: InAppBrowser, private deviceFeedback: DeviceFeedback) {
    this.slidesPerView = (plt.isPortrait() && plt.width() < 768 ? 3 : 4);
  }

  openUrl(url) {
    this.deviceFeedback.haptic(0);

    this.inappbrowser.create(url, '_system');
  }

  openMore() {
    this.deviceFeedback.haptic(0);
    
    let modal = this.modalCtrl.create(InteractionMorePage);
    modal.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
