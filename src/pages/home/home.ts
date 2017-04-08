import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { BookPage } from '../book/book';

import { LastBookVisitedService }  from '../../providers/last-book-visited-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private lastBookVisitedService: LastBookVisitedService) {
  }

  ionViewWillEnter() {    
    this.openLastBook();
  }

  openLastBook() {
    this.lastBookVisitedService.getLastBook().
      then(lastbook => {
        this.navCtrl.setRoot(BookPage, {
          book: lastbook.book,
          chapterNumber: lastbook.chapterNumber
        });
      });
  }
}
