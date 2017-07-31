import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { BookService } from '../../providers/book-service';
import { BookModel }  from '../../models/book-model'

import { ChaptersPage } from '../chapters/chapters';

@Component({
  selector: 'page-books',
  templateUrl: 'books.html',
  providers: [BookService]
})
export class BooksPage {
  @ViewChild(Content) content: Content;

  testament: string;

  oldbooks: BookModel[] = [];
  newbooks: BookModel[] = [];

  currentBookId: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private deviceFeedback: DeviceFeedback, public bookService: BookService) {
    this.currentBookId = navParams.get('currentBookId');

    this.bookService.getAll()
    .subscribe(
      data => {
        this.oldbooks = data.slice(0, 39);
        this.newbooks = data.slice(39, data.length);

        this.testament =
          this._getBookIndex(data, this.currentBookId) < 39 ? "old" : "new";
      },
      err => console.log(err));
  }

  ionViewWillEnter() {
    setTimeout(() => this._scrollToCurrentBook(), 10);
  }

  openChapters(event, book) {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(ChaptersPage, {
      book: book
    });
  }

  _getBookIndex(books: BookModel[], bookId: string) {
    let i = 0;
    for(; i <= books.length; ++i) {
      if (books[i].id == bookId)
        return i;
    }
  }

  _scrollToCurrentBook() {
    let yOffset = document.getElementById(this.currentBookId).offsetTop;
    this.content.scrollTo(0, yOffset, 0);
  }
}
