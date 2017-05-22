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

  testament: string = "old";

  oldbooks: BookModel[] = [];
  newbooks: BookModel[] = [];

  constructor(public navCtrl: NavController, private deviceFeedback: DeviceFeedback, public bookService: BookService) {
    this.bookService.getAll()
    .subscribe(
      data => {
        this.oldbooks = data.slice(0, 39);
        this.newbooks = data.slice(39, data.length);
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
