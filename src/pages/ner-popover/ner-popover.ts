import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';
import { EmailComposer } from '@ionic-native/email-composer';

import { NERModel }  from '../../models/ner-model'

@Component({
  selector: 'page-ner-popover',
  templateUrl: 'ner-popover.html'
})
export class NERPopOverPage {

  title: string;
  entity: NERModel;

  constructor(public navParams: NavParams, public viewCtrl: ViewController, public inappbrowser: InAppBrowser, private emailComposer: EmailComposer, private deviceFeedback: DeviceFeedback) {
    this.title = navParams.get('title');
    this.entity = navParams.get('entity');
  }

  openNER() {   
    this.deviceFeedback.haptic(0);

    this.inappbrowser.create(this.entity.uri, '_system');

    this.viewCtrl.dismiss();
  }

  reportError() {
    this.deviceFeedback.acoustic();

    let content = [
      this.title,
      '',
      'Marque com “x” a opção que melhor traduza o erro:',
      '',
      '[  ] O item não tem relação com o versículo.',
      '[  ] A imagem não é mostrada ou não confere com o item.'
    ];

    let email = {
      to: 'mobilebibleapp@gmail.com',
      subject: 'Aviso de erro',
      body: content.join('<br/>'),
    };

    this.emailComposer.hasPermission()
      .then(hasPermission => {
        if (hasPermission) {
          this.emailComposer.open(email);
        } else {
          this.emailComposer.requestPermission().then(granted => {
            console.log('granted', granted);
            this.emailComposer.open(email);
          });
        }
      })
      .catch((err) => alert('Email Composer not available'));

    this.viewCtrl.dismiss();
  }
}
