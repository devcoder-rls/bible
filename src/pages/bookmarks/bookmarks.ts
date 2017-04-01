import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BookmarkService } from '../../providers/bookmark-service';
import { BookService } from '../../providers/book-service';

import { BookPage } from '../book/book';

@Component({
  selector: 'page-bookmarks',
  templateUrl: 'bookmarks.html',
  providers: [BookmarkService, BookService]
})
export class BookmarksPage {

  bookmarkList: any;
  bookmarks: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public bookmarkService: BookmarkService, public bookService: BookService) {
    this.bookmarkList = navParams.get('bookmarkList');
  }

  ionViewDidLoad() {
    this.bookmarks = this.bookmarkService.getBookmarks(this.bookmarkList.id);
  }

  openBook(event, bookmark) {   
    this.bookService.get(bookmark.bookId)
      .subscribe(book => {
        this.navCtrl.setRoot(BookPage, {
          book: book,
          chapterNumber: bookmark.chapterNumber
        });
      });
  }

  remove(bookmark) {
    this.bookmarkService.removeBookmark(this.bookmarkList.id, bookmark)
      .then(() => {
        this.bookmarks = this.bookmarkService.getBookmarks(this.bookmarkList.id);
      });    
  }
}
