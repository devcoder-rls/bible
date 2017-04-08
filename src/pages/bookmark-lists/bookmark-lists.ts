import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { BookmarkService } from '../../providers/bookmark-service';

import { BookmarksPage } from '../bookmarks/bookmarks';

@Component({
  selector: 'page-bookmark-lists',
  templateUrl: 'bookmark-lists.html',
  providers: [BookmarkService]
})
export class BookmarkListsPage {

  bookmarkLits: any;

  constructor(public navCtrl: NavController, private deviceFeedback: DeviceFeedback, public bookmarkService: BookmarkService) {}

  ionViewWillEnter() {
    this.bookmarkLits = this.bookmarkService.getLists();
  }

  openBookmarks(bookmarkList) {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(BookmarksPage, {
      bookmarkList: bookmarkList
    });
  }

}
