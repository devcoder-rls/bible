export class Font {
	constructor(public name: string, public label: string) {}
}

export class SettingsModel {

  static readonly AVAILABLE_FONTS: Array<Font> = 
  [
  	new Font('roboto', 'Roboto (Padrão)'),
  	new Font('arial', 'Arial'),
  	new Font('palatino', 'Palatino'),
  	new Font('times-new-roman', 'Times New Roman'),
  	new Font('verdana', 'Verdana')
  ];

  constructor(public textsize?: number, public fontname?: string, public showPassageTitle?: boolean, public showBookmarks?: boolean, public keepScreenOn?: boolean, public nightMode?: boolean) {
  }

}