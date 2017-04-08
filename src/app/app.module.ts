import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { SettingsService } from '../providers/settings-service';

import { DeviceFeedback } from '@ionic-native/device-feedback';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Insomnia } from '@ionic-native/insomnia';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Toast } from '@ionic-native/toast';

import { HomePage } from '../pages/home/home';
import { BooksPage } from '../pages/books/books';
import { BookPage } from '../pages/book/book';
import { ChaptersPage } from '../pages/chapters/chapters';
import { InteractionPage } from '../pages/interaction/interaction';
import { InteractionMorePage } from '../pages/interaction-more/interaction-more';
import { BookmarkListsPage } from '../pages/bookmark-lists/bookmark-lists';
import { BookmarksPage } from '../pages/bookmarks/bookmarks';
import { SettingsPage } from '../pages/settings/settings';
import { PopOverPage } from '../pages/popover/popover';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    BooksPage,
    BookPage,
    ChaptersPage,
    InteractionPage,
    InteractionMorePage,
    BookmarkListsPage,
    BookmarksPage,
    SettingsPage,
    PopOverPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    BooksPage,
    BookPage,
    ChaptersPage,
    InteractionPage,
    InteractionMorePage,
    BookmarkListsPage,
    BookmarksPage,
    SettingsPage,
    PopOverPage
  ],
  providers: [
    DeviceFeedback,
    InAppBrowser,
    Insomnia,
    SocialSharing,    
    SplashScreen,
    StatusBar, 
    Toast,
    {provide: ErrorHandler, useClass: IonicErrorHandler}, 
    SettingsService]
})
export class AppModule {}
