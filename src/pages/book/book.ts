import { Component, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NavController, NavParams, Content, Searchbar, Slides, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Toast } from '@ionic-native/toast';
import { DeviceFeedback } from '@ionic-native/device-feedback';

import { BookService } from '../../providers/book-service';
import { ChapterService } from '../../providers/chapter-service';
import { SearchService } from '../../providers/search-service';
import { BookmarkService } from '../../providers/bookmark-service';
import { VersesSelectedService } from '../../providers/verses-selected-service';
import { LastBookVisitedService }  from '../../providers/last-book-visited-service';
import { SettingsService } from '../../providers/settings-service';

import { ChapterModel }  from '../../models/chapter-model'
import { SettingsModel }  from '../../models/settings-model'

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

  book: any;

  settings: SettingsModel;

  chapters: ChapterModel[] = [];
  currentChapterNumber: number;

  initialVerserNumberVisible: number;

  initialSlide = 0; 

  selectedVerses: VersesSelectedService;

  showActions: boolean = false;
  stateActions: string = 'hide';

  showSearchBar: boolean = false;
  currentKeyword: String = "";
  lastKeyword: String;
  searchResults: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public modalCtrl: ModalController, private socialSharing: SocialSharing, private deviceFeedback: DeviceFeedback, private toast: Toast, public chapterService: ChapterService, public searchService: SearchService, public bookmarkService: BookmarkService, public lastBookVisitedService: LastBookVisitedService, public settingsService: SettingsService) {
    this.book = navParams.get('book');

    this.currentChapterNumber = navParams.get('chapterNumber');
    this.initialVerserNumberVisible = navParams.get('verseNumber');

    this.settings = new SettingsModel();
    this.selectedVerses = new VersesSelectedService();    

    this.initialSlide = this.currentChapterNumber -1;

    // Create a list of chapter with only number (for lazy load of verses)
    for (var _i = 0; _i < this.book.chapterAmount; _i++)
      this.chapters[_i] = new ChapterModel(null, _i+1, null);

    this.lastBookVisitedService.setLastBook(this.book, this.currentChapterNumber);
  }

  ionViewDidLoad() {
    this._loadCurrentChapter(this.currentChapterNumber);

    this._loadNearChapters(this.currentChapterNumber);
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
    this.showSearchBar = true;

    setTimeout(() => {
      this.searchbar.setFocus();
    }, 150);
  }

  searchThis(event) {
    console.log('searchThis', this.currentKeyword);

    if (this.lastKeyword == this.currentKeyword)
      return;

    this.lastKeyword = this.currentKeyword;

    this.searchService.search(this.currentKeyword)
    .subscribe(
      data => {
        this.searchResults = data;
      },
      err => {
        console.log(err);
      },
      () => {
        // Todo: This force VirtualScroll re-render content
        event.target.blur();
        event.target.focus();
        setTimeout(() => { this.content.scrollTo(0, 1, 0); }, 50);

        let count = this.searchResults.length;

        if (count > 20) {
          this.toast.showLongCenter('Foram encontrados ' + count + ' versículos.')
            .subscribe(() => {});
        }
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
    this.showSearchBar = false;
    this.currentKeyword = null;
    this.searchResults = [];
  }

  presentPopover(event) {
    this.deviceFeedback.acoustic();

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

                let self = this;
                setTimeout(() => {
                  // Reload current chapter
                  self._loadCurrentChapter(self.currentChapterNumber);
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

  _loadCurrentChapter(chapterNumber: number) {
    console.log('_loadCurrentChapter', chapterNumber);

    this.chapterService.get(this.book, chapterNumber)
    .subscribe(
      chapter => { 
        this.currentChapterNumber = chapter.number;

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

  _loadNearChapters(chapterNumber: number) {
    let chapterIndex = chapterNumber -1;

    if (chapterNumber > 1 
      && !this.chapters[chapterIndex-1].passages) {
      this.chapterService.get(this.book, chapterNumber-1)
      .subscribe(
        chapter => { 
          console.log("Loaded prev chapter ", chapter.number);
          this.chapters[chapter.number-1] = chapter;
        },
        err => console.log(err));
    }

    if (chapterNumber < this.book.chapterAmount 
      && !this.chapters[chapterIndex+1].passages) {
      this.chapterService.get(this.book, chapterNumber+1)
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
