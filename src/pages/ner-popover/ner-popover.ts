import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DeviceFeedback } from '@ionic-native/device-feedback';
import { Toast } from '@ionic-native/toast';

import { AmplifyService }  from 'aws-amplify-angular';

import { NERModel }  from '../../models/ner-model'

@Component({
  selector: 'page-ner-popover',
  templateUrl: 'ner-popover.html'
})
export class NERPopOverPage {

  title: string;
  entity: NERModel;

  ERROR_OPTIONS = [
    {id: '0', text: 'O item não tem relação com o versículo.'},
    {id: '1', text: 'A imagem não é mostrada ou não confere com o item.'}
  ];

  constructor(public navParams: NavParams, public viewCtrl: ViewController, public amplify: AmplifyService, public inappbrowser: InAppBrowser, private alertCtrl: AlertController, private deviceFeedback: DeviceFeedback, private toast: Toast) {
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

    this.viewCtrl.dismiss();

    this._showReportOptions();    
  }

  _showReportOptions() {
    let inputs = this.ERROR_OPTIONS.map((list) => {
      return { type: 'radio', label: list.text, value: list.id };
    });

    let prompt = this.alertCtrl.create({
      title: 'Aviso de erro',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: listId => {
            if (listId == null)
              return false;

            this._sendReport(this.ERROR_OPTIONS[listId]);
          }
        }
      ]
    });

    prompt.present();
  }

  _sendReport(option) {
    this.amplify.analytics().record('NERErrorReport', {
      'entity': this.entity,
      'text': option.text
    });

    try {
      this.toast.showLongCenter('Aviso enviado com sucesso.')
        .subscribe(() => {});
    } catch(err) {
      console.log(err);
    }
  }
}
