import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Insomnia } from '@ionic-native/insomnia';

import { SettingsModel }  from '../models/settings-model'

@Injectable()
export class SettingsService {

  private SETTINGS_KEY: string = "settings";

  private DEFAULTS: {[param: string]: any} = {
    'textsize': 13,
    'fontname': 'roboto',
    'showPassageTitle': true, 
    'showBookmarks': true, 
    'keepScreenOn': false, 
    'nightMode': false,
    'enableInteration': false
  }

  private settings: SettingsModel;

  constructor(private storage: Storage, private insomnia: Insomnia) {
  }

  apply() {
    this._loadSettings().then(() => {
      this._apply(this.settings);
    });
  }

  getSettings() {
    if (this.settings != null)
      return new Promise((resolve, reject) => { resolve(this.settings); });
    
    return this._loadSettings().then(() => {
      return this.settings;
    });
  }

  update(settings: SettingsModel) {
    this.settings = settings;
    this._apply(this.settings);

    this.storage.set(this.SETTINGS_KEY, this.settings);
  }

  _loadSettings() {
    return this.storage.get(this.SETTINGS_KEY)
      .then(data => {

        this.settings = new SettingsModel(
          this._getParamValueOrDefault(data, 'textsize'), 
          this._getParamValueOrDefault(data, 'fontname'), 
          this._getParamValueOrDefault(data, 'showPassageTitle'), 
          this._getParamValueOrDefault(data, 'showBookmarks'), 
          this._getParamValueOrDefault(data, 'keepScreenOn'), 
          this._getParamValueOrDefault(data, 'nightMode'),
          this._getParamValueOrDefault(data, 'enableInteration'));

        return this.settings;
      }
    );
  }

  _apply(settings: SettingsModel) {
    // Keep Screen On
    if (settings.keepScreenOn) {
      this.insomnia.keepAwake();
    } else {
      this.insomnia.allowSleepAgain();
    }
  }

  _getParamValueOrDefault(data, name: string) {
    if (data == null)
      return this.DEFAULTS[name];

    return data[name] || this.DEFAULTS[name];
  }
}