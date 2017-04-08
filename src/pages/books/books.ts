import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
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

  books: BookModel[] = [];

  constructor(public navCtrl: NavController, private deviceFeedback: DeviceFeedback, public bookService: BookService) {
    this.bookService.getAll()
    .subscribe(
      data => {
        this.books = data;
      },
      err => console.log(err));
  }

  openChapters(event, book) {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(ChaptersPage, {
      book: book
    });
  }
}
