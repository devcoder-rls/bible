import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { NERModel }  from '../../models/ner-model'
import { InteractionService } from '../../providers/interaction-service';
import { VersesSelectedService } from '../../providers/verses-selected-service';

@Component({
  selector: 'page-interaction-partial',
  templateUrl: 'interaction-partial.html',
  providers: [InteractionService]
})
export class InteractionPartialPage {

  book: any;
  chapterNumber: number;
  verses: VersesSelectedService;

  entities: any;

  loading: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController, public plt: Platform, public inappbrowser: InAppBrowser, private deviceFeedback: DeviceFeedback, public interactionService: InteractionService) {
    this.book = navParams.get('book');
    this.chapterNumber = navParams.get('chapterNumber');
    this.verses = navParams.get('verses');

    this._loadData();
  }

  openUrl(url) {
    this.deviceFeedback.haptic(0);

    this.inappbrowser.create(url, '_system');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  // Indicate that need show the spot if it is different from the label.
  needShowSpot(entity: NERModel) {
    return entity.spot.toLowerCase() !== entity.label.toLowerCase();
  }

  _loadData() {
    this.loading = true;

    let versesNumbers = this.verses.getVerses().map((verse) => verse.number);

    this.entities = 
      this.interactionService.get(this.book.id, this.chapterNumber, versesNumbers);

    this.entities.then(() => this.loading = false);
  }
}
