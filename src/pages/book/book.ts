import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/core';
import { NavController, NavParams, Content, Searchbar, Slides, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { SocialSharing, Keyboard, DeviceFeedback, Toast } from 'ionic-native';

import { BookService } from '../../providers/book-service';
import { ChapterService } from '../../providers/chapter-service';
import { SearchService } from '../../providers/search-service';
import { BookmarkService } from '../../providers/bookmark-service';
import { VersesSelectedService } from '../../providers/verses-selected-service';

import { ChapterModel }  from '../../models/chapter-model'

import { BooksPage } from '../books/books';
import { ChaptersPage } from '../chapters/chapters';
import { InteractionPage } from '../interaction/interaction';
import { PopOverPage } from '../popover/popover';

@Component({
  selector: 'page-book',
  templateUrl: 'book.html',
  providers: [BookService, ChapterService, SearchService, BookmarkService],
  animations: [
    trigger('showactions', [
      state('show', style({bottom: '*'})),
      state('hide', style({bottom: '0px'})),
      transition('show <=> hide', [
        animate(40)
      ])
    ])
  ]
})
export class BookPage {
  @ViewChild(Content) content: Content;
  @ViewChild('searchbar') searchbar: Searchbar;
  @ViewChild('chapterSlider') slider: Slides;
  @ViewChildren('chapterSlide') slides: QueryList<ElementRef>;

  book: any;

  chapters: ChapterModel[] = [];
  currentChapterNumber: number;

  initialSlide = 0;

  selectedVerses: VersesSelectedService;

  showActions: boolean = false;
  stateActions: string = 'hide';

  showSearchBar: boolean = false;
  searchResults: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public modalCtrl: ModalController, public chapterService: ChapterService, public searchService: SearchService, public bookmarkService: BookmarkService) {
    this.book = navParams.get('book');

    this.currentChapterNumber = navParams.get('chapterNumber');

    this.selectedVerses = new VersesSelectedService();

    this.initialSlide = this.currentChapterNumber -1;
    console.log('constructor:initialSlide', this.initialSlide);

    // Create a list of chapter with only number (for lazy load of verses)
    for (var _i = 0; _i < this.book.chapterAmount; _i++)
      this.chapters[_i] = new ChapterModel(null, _i+1, null);

    this.chapterService.get(this.book, navParams.get('chapterNumber'))
    .subscribe(
      chapter => { 
        this.currentChapterNumber = chapter.number;
        this.chapters[chapter.number-1] = chapter;
      },
      err => console.log(err));

      this._loadNearChapters(navParams.get('chapterNumber'));
  }

  ionViewDidEnter() {
    this.onChapterChanged();
  }

  openBooks() {
    DeviceFeedback.acoustic();

    this.navCtrl.push(BooksPage);

    this._clearAllVerseSelection();
  }

  openChapters() {
    DeviceFeedback.acoustic();

    this.navCtrl.push(ChaptersPage, {
      book: this.book
    });

    this._clearAllVerseSelection();
  }

  openSearchBar() {
    this.showSearchBar = true;

    this._lockSlides();

    setTimeout(() => {
      this.searchbar.setFocus();
      Keyboard.show();
    }, 150);
  }

  searchThis(event) {
    let value = event.target.value;

    this.searchService.searchall(value)
    .subscribe(
      data => {
        this.searchResults = data;
      },
      err => {
        console.log(err);
      },
      () => {
        let count = this.searchResults.length;

        if (count > 20) {
          Toast.show('Foram encontrados ' + count + ' versículos.', '5000', 'center')
          .subscribe(toast => {});
        }
      }
    );
  }

  cancelSearch(event) {
    this.showSearchBar = false;
    this.searchResults = [];

    this._unlockSlides();
  }

  presentPopover(event) {
    DeviceFeedback.acoustic();

    let popover = this.popoverCtrl.create(PopOverPage);
    popover.present({ev: event});
  }

  onChapterChanged() {
    try {
      let currentSlideIndex = this.slider.getActiveIndex();

      this.currentChapterNumber = this.chapters[currentSlideIndex].number;

      this._loadNearChapters(this.currentChapterNumber);
    } catch(e) {
      // Do nothing
    }
  }

  onVerseHold(verse, event) {
    DeviceFeedback.haptic(0);

    let target: any = event.target;

    while(target.tagName != 'ION-ITEM')
        target = target.parentElement;

    if (this.selectedVerses.contains(verse)) {
        this._clearVerseSelection(verse);
    } else {
        target.classList.add("item-selected");
        this.selectedVerses.addVerse(verse, target);
    }

    this.showActions = this.selectedVerses.length() > 0;
    this.stateActions = this.showActions ? 'show' : 'hide';

    if (this.showActions)
      this._lockSlides();
    else
      this._unlockSlides();
  }

  addToBookmark() {
    this.bookmarkService.getLists().then(lists =>
    {
      let inputs = lists.map((list) => {
        return { type: 'radio', label: list.name, value: list.id };
      });

      let prompt = this.alertCtrl.create({
        title: 'Lista de leitura',
        inputs: inputs,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Ok',
            handler: listId => {
              this.bookmarkService.addBookmark(
                listId, this.chapters[this.currentChapterNumber-1], this.selectedVerses.getVerses());

              this._clearAllVerseSelection();
            }
          }
        ]
      });

      prompt.present();
    });
  }

  openInteractivity() {
    let modal = this.modalCtrl.create(InteractionPage, { userId: 8675309 });
    modal.present();

    this._clearAllVerseSelection();
  }

  share() {
    let options = {
      message: 'share this', // not supported on some apps (Facebook, Instagram)
      url: 'https://www.website.com/foo/#bar?a=b',
      chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
    };

    SocialSharing.shareWithOptions(options);

    this._clearAllVerseSelection();
  }

  _loadNearChapters(number) {
    let chapterIndex = number -1;

    if (number > 1 
      && !this.chapters[chapterIndex-1].passages) {
      this.chapterService.get(this.book, number-1)
      .subscribe(
        chapter => { 
          console.log("Loaded prev chapter ", chapter.number);
          this.chapters[chapter.number-1] = chapter;
        },
        err => console.log(err));
    }

    if (number < this.book.chapterAmount 
      && !this.chapters[chapterIndex+1].passages) {
      this.chapterService.get(this.book, number+1)
      .subscribe(
        chapter => { 
          console.log("Loaded next chapter ", chapter.number);
          this.chapters[chapter.number-1] = chapter;
        },
        err => console.log(err));
    }

    // Cleanup some chapters
    for (var _i = 0; _i < this.book.chapterAmount; _i++) {
      if (_i >= chapterIndex-1 && _i <= chapterIndex+1)
        continue;

      this.chapters[_i].passages = null;
    }
  }

  _lockSlides() {
    this.slider.lockSwipes(true);
  }

  _unlockSlides() {
    this.slider.lockSwipes(false);
  }

  _clearAllVerseSelection() {
    for (let verse of this.selectedVerses.getVerses())
      this._clearVerseSelection(verse);

    this.showActions = false;
    this.stateActions = 'hide';

    this._unlockSlides();
  }

  _clearVerseSelection(verse) {
    let verseElement: HTMLElement = this.selectedVerses.get(verse);
    verseElement.classList.remove("item-selected")

    this.selectedVerses.removeVerse(verse);
  }
}
