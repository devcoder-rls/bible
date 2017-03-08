import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { BookModel }  from '../../models/book-model'

import { BookPage } from '../book/book';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
  }

  ionViewWillEnter() {    
    this.openLastBook();
  }

  openLastBook() {
    let book: BookModel = new BookModel('mateus', 'Evangelho de Jesus segundo Mateus', 'Mateus', 29);

    this.navCtrl.setRoot(BookPage, {
      book: book,
      chapterNumber: 1
    });
  }
}
