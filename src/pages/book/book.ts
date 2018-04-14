import { Component, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NavController, NavParams, Slides, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
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
import { InteractionPartialPage } from '../interaction-partial/interaction-partial';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public modalCtrl: ModalController, private clipboard: Clipboard, private socialSharing: SocialSharing, private deviceFeedback: DeviceFeedback, public chapterService: ChapterService, public bookmarkService: BookmarkService, public lastBookVisitedService: LastBookVisitedService, public settingsService: SettingsService) {
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

    this.navCtrl.push(BooksPage, {
      currentBookId: this.book.id
    });

    this.clearAllVerseSelection();
  }

  openChapters() {
    this.deviceFeedback.acoustic();

    this.navCtrl.push(ChaptersPage, {
      book: this.book
    });

    this.clearAllVerseSelection();
  }

  openSearchBar() {
    this.navCtrl.push(SearchPage);

    this.clearAllVerseSelection();
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

  clearAllVerseSelection() {
    for (let verse of this.selectedVerses.getVerses())
      this._clearVerseSelection(verse);

    this.showActions = false;
    this.stateActions = 'hide';

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
              if (listId == null)
                return false;

              this.bookmarkService.addBookmark(
                listId, this.chapters[this.currentChapterNumber-1], this.selectedVerses.getVerses())
              .then(() => {
                this.clearAllVerseSelection();

                setTimeout(() => {
                  // Reload current chapter, mantain current position
                  let yOffset = this._getCurrentOffsetTop();
                  this._loadCurrentChapter(yOffset);
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
    let modal = this.modalCtrl.create(InteractionPartialPage, { 
      book: this.book,
      chapterNumber: this.currentChapterNumber,
      verses: this.selectedVerses 
    }, {cssClass: 'partial-modal'});

    modal.onDidDismiss(data => {
      this.clearAllVerseSelection();
    });

    modal.present();
  }

  copy() {
    if (this.selectedVerses.length() == 0)
      return;

    let message = this.book.name + " " + this.currentChapterNumber + "\n\n";

    message += this.selectedVerses.getVerses()
      .map(function(verse) { return "(" + verse.number + ") " + verse.text; })
      .join('\n');

    this.clipboard.copy(message);

    this.clearAllVerseSelection();
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
      url: 'Para ler esse e outros livros da Bíblia Sagrada, baixe o aplicativo grátis http://bit.ly/mobilebibleapp',
      chooserTitle: 'Escolha um aplicativo'
    };

    this.socialSharing.shareWithOptions(options)
      .then((result) => {
        this.clearAllVerseSelection();
      });
  }

  _setCurrentBook(book: any, chapterNumber: number) {
    this.book = book;
    this.currentChapterNumber = chapterNumber;

    this.lastBookVisitedService.setLastBook(book, chapterNumber);
  }

  _loadCurrentChapter(offsetTopInit?: number) {
    if (this.currentChapterNumber == null)
      throw new Error('Current chapter number not defined.');

    console.log('_loadCurrentChapter', this.currentChapterNumber, offsetTopInit);

    this.chapterService.get(this.book, this.currentChapterNumber)
    .subscribe(
      chapter => {
        // Set content of current chapter
        this.chapters[chapter.number-1] = chapter;
      },
      err => console.log(err),
      () => {
        setTimeout(() => {
          // Scroll to position indicated
          if (offsetTopInit > 0) {
            this._setOffsetTop(offsetTopInit);
          } else if (this.initialVerserNumberVisible > 0) {
            this._setOffsetTopFromVerse(this.initialVerserNumberVisible);
          }
        }, 0);
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

  _clearVerseSelection(verse) {
    let verseElement: HTMLElement = this.selectedVerses.get(verse);
    verseElement.classList.remove("item-selected")

    this.selectedVerses.removeVerse(verse);
  }

  _getCurrentOffsetTop() {
    let chapterId = "c" + this.currentChapterNumber;
    let targetSlide = document.getElementById(chapterId).childNodes[0];
    return (<Element>targetSlide).scrollTop;
  }

  _setOffsetTop(offsetTop: number) {
    let chapterId = "c" + this.currentChapterNumber;
    let targetSlide = document.getElementById(chapterId).childNodes[0];
    (<Element>targetSlide).scrollTop = offsetTop;
  }

  _setOffsetTopFromVerse(verseNumber: number) {
    let verseId = "c" + this.currentChapterNumber + "v" + verseNumber;
    let offsetTop = document.getElementById(verseId).offsetTop;

    this._setOffsetTop(offsetTop);
  }
}
