import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { AppRate } from '@ionic-native/app-rate';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SettingsService } from '../providers/settings-service';

import { SettingsModel }  from '../models/settings-model'

import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = HomePage;

  settings: SettingsModel;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, appRate: AppRate, settingsService: SettingsService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      this.settings = new SettingsModel();

      settingsService.apply();

      settingsService.getSettings()
      .then(settings => {
        this.settings = settings;
      });

      splashScreen.hide();

      if (appRate.preferences != null) {
        appRate.preferences.useLanguage = 'pt-PT';
        appRate.preferences.usesUntilPrompt = 10;
        appRate.preferences.storeAppURL = {
          android: 'market://details?id=com.mobilebibleapp.bible'
        };

        appRate.promptForRating(false);
      }
    });
  }
}
