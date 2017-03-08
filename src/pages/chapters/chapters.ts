import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DeviceFeedback } from 'ionic-native';

import { BookModel }  from '../../models/book-model'

import { BookPage } from '../book/book';

@Component({
  selector: 'page-chapters',
  templateUrl: 'chapters.html'
})
export class ChaptersPage {

  book: BookModel;
  chaptersNumber: number[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.book = navParams.get('book');

    this.chaptersNumber = Array(this.book.chapterAmount).fill(0).map((x, i) => i+1);
  }

  openBook(event, chapterNumber) {
    DeviceFeedback.acoustic();
    
    this.navCtrl.setRoot(BookPage, {
      book: this.book,
      chapterNumber: chapterNumber
    });
  }
}
