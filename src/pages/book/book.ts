import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/core';
import { NavController, NavParams, Content, Searchbar, Slides, AlertController, PopoverController, ModalController, ToastController } from 'ionic-angular';
import { SocialSharing, Keyboard, DeviceFeedback } from 'ionic-native';

import { BookService } from '../../providers/book-service';
import { ChapterService } from '../../providers/chapter-service';
import { SearchService } from '../../providers/search-service';

import { ChapterModel }  from '../../models/chapter-model'

import { BooksPage } from '../books/books';
import { ChaptersPage } from '../chapters/chapters';
import { InteractionPage } from '../interaction/interaction';
import { PopOverPage } from '../popover/popover';

@Component({
  selector: 'page-book',
  templateUrl: 'book.html',
  providers: [BookService, ChapterService, SearchService],
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

  selectedVerses: HTMLElement[] = [];

  showActions: boolean = false;
  stateActions: string = 'hide';

  showSearchBar: boolean = false;
  searchResults: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public modalCtrl: ModalController, public toastCtrl: ToastController, public chapterService: ChapterService, public searchService: SearchService) {
    this.book = navParams.get('book');

    this.currentChapterNumber = navParams.get('chapterNumber');

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
          let toast = this.toastCtrl.create({
            message: 'Foram encontrados ' + count + ' versículos.',
            duration: 5000,
            position: 'bottom'
          });

          toast.present(); 
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

  onVerseHold(event) {
    DeviceFeedback.haptic(0);

    let target: any = event.target;

    while(target.tagName != 'ION-ITEM')
        target = target.parentElement;

    let index: number = this.selectedVerses.indexOf(target);

    if (index > -1) {
        this._clearVerseSelection(index, target);
    } else {
        target.style.backgroundColor = '#EEE';
        this.selectedVerses.push(target);
    }

    this.showActions = this.selectedVerses.length > 0;
    this.stateActions = this.showActions ? 'show' : 'hide';

    if (this.showActions)
      this._lockSlides();
    else
      this._unlockSlides();
  }

  addToBookmark() {
    let prompt = this.alertCtrl.create({
      title: 'Lista de leitura',
      inputs: [
        {
          type: 'radio',
          label: 'Ler mais tarde',
          value: '1'
        },
        {
          type: 'radio',
          label: 'Interessante',
          value: '2'
        },
        {
          type: 'radio',
          label: 'Favorito',
          value: '3'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: data => {
            console.log('Saved clicked', data);
          }
        }
      ]
    });

    prompt.present();

    this._clearAllVerseSelection();
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
    while (this.selectedVerses.length > 0)
      this._clearVerseSelection(0, this.selectedVerses[0]);

    this.showActions = false;
    this.stateActions = 'hide';

    this._unlockSlides();
  }

  _clearVerseSelection(index, verseElement) {
    verseElement.style.backgroundColor = '';
    this.selectedVerses.splice(index, 1);
  }
}
