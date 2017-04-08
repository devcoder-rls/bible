import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { BookModel }  from '../../models/book-model'

import { BookPage } from '../book/book';

@Component({
  selector: 'page-chapters',
  templateUrl: 'chapters.html'
})
export class ChaptersPage {

  book: BookModel;
  chaptersNumber: number[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private deviceFeedback: DeviceFeedback) {
    this.book = navParams.get('book');

    this.chaptersNumber = Array(this.book.chapterAmount).fill(0).map((x, i) => i+1);
  }

  openBook(event, chapterNumber) {
    this.deviceFeedback.acoustic();
    
    this.navCtrl.setRoot(BookPage, {
      book: this.book,
      chapterNumber: chapterNumber
    });
  }
}
