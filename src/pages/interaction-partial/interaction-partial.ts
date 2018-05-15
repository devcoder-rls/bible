import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { AmplifyService }  from 'aws-amplify-angular';

import { NERModel }  from '../../models/ner-model'
import { InteractionService } from '../../providers/interaction-service';
import { VersesSelectedService } from '../../providers/verses-selected-service';

import { NERPopOverPage } from '../ner-popover/ner-popover';

@Component({
  selector: 'page-interaction-partial',
  templateUrl: 'interaction-partial.html',
  providers: [InteractionService]
})
export class InteractionPartialPage {

  book: any;
  chapterNumber: number;
  selectedVerses: VersesSelectedService;

  entities: any;

  loading: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public amplify: AmplifyService, public popoverCtrl: PopoverController, public inappbrowser: InAppBrowser, private deviceFeedback: DeviceFeedback, public interactionService: InteractionService) {
    this.book = navParams.get('book');
    this.chapterNumber = navParams.get('chapterNumber');
    this.selectedVerses = navParams.get('verses');

    this._loadData();

    this.amplify.analytics().record('interactionPartialVisit', {
      'bookShortName': this.book.shortName,
      'chapterNumber': this.chapterNumber,
      'versesNumber': this.selectedVerses.getVerses().map((verse) => verse.number)
    });
  }

  open(entity: NERModel) {
    this.deviceFeedback.haptic(0);

    this.amplify.analytics().record('NEROpen', {
      'label': entity.label
    });

    this.inappbrowser.create(entity.uri, '_system');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  // Indicate that need show the spot if it is different from the label.
  needShowSpot(entity: NERModel) {
    return entity.spot.toLowerCase() !== entity.label.toLowerCase();
  }

  presentPopover(entity: NERModel, event) {
    this.deviceFeedback.acoustic();

    let popover = this.popoverCtrl.create(NERPopOverPage, {
      "title": this.book.shortName + ', ' + this.chapterNumber + ' : ' + this.selectedVerses.formatVersesNumbers(),
      "entity": entity
    }, {
      cssClass: 'custom-popover'
    });

    popover.present({ev: event});
  }

  _loadData() {
    this.loading = true;

    let versesNumbers = this.selectedVerses.getVerses().map((verse) => verse.number);

    this.entities = 
      this.interactionService.get(this.book.id, this.chapterNumber, versesNumbers);

    this.entities.then(() => this.loading = false);
  }
}
