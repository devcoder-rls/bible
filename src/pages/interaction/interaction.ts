import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { InteractionService } from '../../providers/interaction-service';

import { InteractionMorePage } from '../interaction-more/interaction-more';

@Component({
  selector: 'page-interaction',
  templateUrl: 'interaction.html',
  providers: [InteractionService]
})
export class InteractionPage {

  book: any;
  chapterNumber: number;

  verses: any[];
  versesNumbers: string;

  entities: any;

  slidesPerView: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController, public plt: Platform, public inappbrowser: InAppBrowser, private deviceFeedback: DeviceFeedback, public interactionService: InteractionService) {
    this.book = navParams.get('book');
    this.chapterNumber = navParams.get('chapterNumber');
    this.verses = navParams.get('verses');

    this._formatVersesNumbers();
    this.slidesPerView = (plt.isPortrait() && plt.width() < 768 ? 3 : 4);

    this._loadData();
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

  _loadData() {
    let versesNumbers = this.verses.map((verse) => verse.number);

    this.entities = 
      this.interactionService.get(this.book.id, this.chapterNumber, versesNumbers);
  }

  _formatVersesNumbers() {
    let numbers = this.verses.map((verse) => verse.number);
    let lastNumber = numbers.pop();

    this.versesNumbers = "";

    if (numbers.length > 0)
      this.versesNumbers = numbers.join(", ") + " e ";

    this.versesNumbers += lastNumber;
  }
}
