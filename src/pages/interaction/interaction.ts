import { Component } from '@angular/core';
import { NavController, ViewController, ModalController, Platform } from 'ionic-angular';
import { InAppBrowser, DeviceFeedback } from 'ionic-native';

import { InteractionMorePage } from '../interaction-more/interaction-more';

@Component({
  selector: 'page-interaction',
  templateUrl: 'interaction.html'
})
export class InteractionPage {

  slidesPerView: number;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public modalCtrl: ModalController, public plt: Platform) {
    this.slidesPerView = (plt.isPortrait() && plt.width() < 768 ? 3 : 4);
  }

  openUrl(url) {
    DeviceFeedback.haptic(0);

    new InAppBrowser(url, '_system');
  }

  openMore() {
    DeviceFeedback.haptic(0);
    
    let modal = this.modalCtrl.create(InteractionMorePage);
    modal.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
