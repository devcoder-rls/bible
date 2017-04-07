import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { SettingsService } from '../providers/settings-service';
import { Insomnia } from '@ionic-native/insomnia';

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
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, SettingsService, Insomnia]
})
export class AppModule {}
