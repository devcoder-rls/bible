import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Insomnia } from '@ionic-native/insomnia';

import { SettingsModel }  from '../models/settings-model'

@Injectable()
export class SettingsService {

  private SETTINGS_KEY: string = "settings";

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
        if (data != null) {
          this.settings = new SettingsModel(data.textsize, data.showPassageTitle, data.showBookmarks, data.keepScreenOn, data.nightMode);
        }
        else {
          this.settings = this._getDefaultSettings();
        }

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

  _getDefaultSettings() {
    return new SettingsModel(13, true, true, false, false);
  }
}