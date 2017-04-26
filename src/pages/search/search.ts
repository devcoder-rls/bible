import { Component, ViewChild } from '@angular/core';
import { NavController, ViewController, Content, Searchbar } from 'ionic-angular';
import { DeviceFeedback } from '@ionic-native/device-feedback';
import { Toast } from '@ionic-native/toast';

import { BookService } from '../../providers/book-service';
import { ChapterService } from '../../providers/chapter-service';
import { SearchService } from '../../providers/search-service';
import { BookmarkService } from '../../providers/bookmark-service';

import { BookPage } from '../book/book';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
  providers: [BookService, ChapterService, SearchService, BookmarkService]
})
export class SearchPage {
  @ViewChild(Content) content: Content;
  @ViewChild('searchbar') searchbar: Searchbar;

  currentKeyword: String = "";
  lastKeyword: String;
  searching: Boolean = false;
  searchResults: Array<any> = [];
  noResults: Boolean = false;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, private deviceFeedback: DeviceFeedback, private toast: Toast, public searchService: SearchService) {
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 150);
  }

  searchThis(event) {
    console.log('searchThis', this.currentKeyword);

    this.noResults = false;

    if (this.currentKeyword.length < 3) {
      this.searchResults = [];
      return;
    }

    if (this.lastKeyword == this.currentKeyword)
      return;

    this.searching = true;

    this.searchService.search(this.currentKeyword)
    .subscribe(
      data => {
        this.searchResults = data;
      },
      err => {
        console.log(err);
      },
      () => {
        this.searching = false;

        let count = this.searchResults.length;

        if (count > 0) {
          // FIXME: This force VirtualScroll re-render content
          event.target.blur();
          event.target.focus();
          setTimeout(() => { this.content.scrollTo(0, 1, 0); }, 150);

          if (count > 10) {
            //this.toast.showLongCenter('Foram encontrados ' + count + ' versículos.')
              //.subscribe(() => {});
          }
        }

        this.lastKeyword = this.currentKeyword;
        this.noResults = (count == 0);
      }
    );
  }

  openBookSearched(event, result) {
    this.deviceFeedback.acoustic();

    this.cancelSearch(event);
  
    this.navCtrl.setRoot(BookPage, {
      book: result.book,
      chapterNumber: result.chapterNumber,
      verseNumber: result.verse.number
    });
  }

  cancelSearch(event) {
    this.currentKeyword = null;
    this.searchResults = [];

    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
