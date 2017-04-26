import { Component, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NavController, NavParams, Slides, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { ChapterService } from '../../providers/chapter-service';
import { BookmarkService } from '../../providers/bookmark-service';
import { VersesSelectedService } from '../../providers/verses-selected-service';
import { LastBookVisitedService }  from '../../providers/last-book-visited-service';
import { SettingsService } from '../../providers/settings-service';

import { ChapterModel }  from '../../models/chapter-model'
import { SettingsModel }  from '../../models/settings-model'

import { BooksPage } from '../books/books';
import { ChaptersPage } from '../chapters/chapters';
import { SearchPage } from '../search/search';
import { InteractionPage } from '../interaction/interaction';
import { PopOverPage } from '../popover/popover';

@Component({
  selector: 'page-book',
  templateUrl: 'book.html',
  providers: [ChapterService, BookmarkService],
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
  @ViewChild('chapterSlider') slider: Slides;

  book: any;

  settings: SettingsModel;

  chapters: ChapterModel[] = [];
  currentChapterNumber: number;

  initialVerserNumberVisible: number;

  initialSlide = 0; 

  selectedVerses: VersesSelectedService;

  showActions: boolean = false;
  stateActions: string = 'hide';

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public modalCtrl: ModalController, private socialSharing: SocialSharing, private deviceFeedback: DeviceFeedback, public chapterService: ChapterService, public bookmarkService: BookmarkService, public lastBookVisitedService: LastBookVisitedService, public settingsService: SettingsService) {
    this._setCurrentBook(navParams.get('book'), navParams.get('chapterNumber'));
    this.initialVerserNumberVisible = navParams.get('verseNumber');

    this.settings = new SettingsModel();
    this.selectedVerses = new VersesSelectedService();    

    this.initialSlide = this.currentChapterNumber -1;

    // Create a list of chapter with only number (for lazy load of verses)
    for (var _i = 0; _i < this.book.chapterAmount; _i++)
      this.chapters[_i] = new ChapterModel(null, _i+1, null);
  }

  ionViewDidLoad() {
    this._loadCurrentChapter();

    // FIXME: Temporary fix until the component swiper call the 
    // event ionSlideDidChange when initial slide is zero.
    if (this.initialSlide == 0) {
      setTimeout(() => {
        this._loadNearChapters();
      }, 100);
    }
  }

  ionViewWillEnter() {
    this.settingsService.getSettings()
      .then(settings => {
        this.settings = settings;
      });
  }

  openBooks() {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(BooksPage);

    this._clearAllVerseSelection();
  }

  openChapters() {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(ChaptersPage, {
      book: this.book
    });

    this._clearAllVerseSelection();
  }

  openSearchBar() {
    this.navCtrl.push(SearchPage);

    this._clearAllVerseSelection();
  }

  presentPopover(event) {
    this.deviceFeedback.acoustic();

    let popover = this.popoverCtrl.create(PopOverPage);
    popover.present({ev: event});
  }

  onChapterChanged() {
    try {
      let currentSlideIndex = this.slider.getActiveIndex();

      this._setCurrentBook(this.book, this.chapters[currentSlideIndex].number);

      setTimeout(() => {
        this._loadNearChapters();
      }, 100);
    } catch(e) {
      // Do nothing
    }
  }

  onVerseHold(verse, event) {
    this.deviceFeedback.haptic(0);

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
                listId, this.chapters[this.currentChapterNumber-1], this.selectedVerses.getVerses())
              .then(() => {
                this._clearAllVerseSelection();

                setTimeout(() => {
                  // Reload current chapter
                  this._loadCurrentChapter();
                }, 500);
              });              
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
    if (this.selectedVerses.length() == 0)
      return;

    let message = this.book.name + " " + this.currentChapterNumber + "\n\n";

    message += this.selectedVerses.getVerses()
      .map(function(verse) { return "(" + verse.number + ") " + verse.text; })
      .join('\n');

    message += '\n\n';

    let options = {
      message: message,
      url: 'Para ler esse e outros livros da Bíblia Sagrada, baixe o aplicativo grátis <URL da loja>',
      chooserTitle: 'Escolha um aplicativo'
    };

    this.socialSharing.shareWithOptions(options)
      .then((result) => {
        this._clearAllVerseSelection();          
      });
  }

  _setCurrentBook(book: any, chapterNumber: number) {
    this.book = book;
    this.currentChapterNumber = chapterNumber;

    this.lastBookVisitedService.setLastBook(book, chapterNumber);
  }

  _loadCurrentChapter() {
    if (this.currentChapterNumber == null)
      throw new Error('Current chapter number not defined.');

    console.log('_loadCurrentChapter', this.currentChapterNumber);

    this.chapterService.get(this.book, this.currentChapterNumber)
    .subscribe(
      chapter => {
        // Set content of current chapter
        this.chapters[chapter.number-1] = chapter;
      },
      err => console.log(err),
      () => {
        // Scroll to verse indicated
        if (this.initialVerserNumberVisible) {
          setTimeout(() => {
            let verseId = "c" + this.currentChapterNumber + "v" + this.initialVerserNumberVisible;

            let yOffset = document.getElementById(verseId).offsetTop;

            let chapterId = "c" + this.currentChapterNumber;
            let targetSlide = document.getElementById(chapterId).childNodes[0];
            (<Element>targetSlide).scrollTop = yOffset;
          }, 0);
        }
      });
  }

  _loadNearChapters() {
    if (this.currentChapterNumber == null)
      throw new Error('Current chapter number not defined.');

    let chapterIndex = this.currentChapterNumber -1;

    if (this.currentChapterNumber > 1 
      && !this.chapters[chapterIndex-1].passages) {
      this.chapterService.get(this.book, this.currentChapterNumber-1)
      .subscribe(
        chapter => { 
          console.log("Loaded prev chapter ", chapter.number);
          this.chapters[chapter.number-1] = chapter;
        },
        err => console.log(err));
    }

    if (this.currentChapterNumber < this.book.chapterAmount 
      && !this.chapters[chapterIndex+1].passages) {
      this.chapterService.get(this.book, this.currentChapterNumber+1)
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
