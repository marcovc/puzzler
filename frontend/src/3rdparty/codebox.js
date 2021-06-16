/** Adapted from: 
 * 
 *  CodeBox
  *
  * Code syntax highlighting tool for Editor.js
  *
  * @version 1.0.0
  * @created - 2020.02.12
  * @author - Adombang Munang Mbomndih (Bomdi) <dzedock@gmail.com> (https://bomdisoft.com)
  * 
  */

 import Vue from 'vue'
 import hljs from 'highlight.js'

require('./style.css').toString();
const DEFAULT_THEMES = ['light', 'dark'];

Vue.use(hljs.vuePlugin);

export default class CodeBox {
  constructor({ data, api, config, readOnly }){
    this.api = api;
    this.readOnly = readOnly;
    this.config = {
      themeName: config.themeName && typeof config.themeName === 'string' ? config.themeName : '',
      themeURL: config.themeURL && typeof config.themeURL === 'string' ? config.themeURL : '',
      useDefaultTheme: (config.useDefaultTheme && typeof config.useDefaultTheme === 'string'
        && DEFAULT_THEMES.includes(config.useDefaultTheme.toLowerCase())) ? config.useDefaultTheme : 'dark',
    };
    this.data = {
      code: data.code && typeof data.code === 'string' ? data.code : '',
      language: 'Minizinc',
      theme: data.theme && typeof data.theme === 'string' ? data.theme : this._getThemeURLFromConfig(),
    };
    this.codeArea = document.createElement('div');
  }

  static get sanitize(){
    return {
      code: true,
      language: false,
      theme: false,
    }
  }

  static get toolbox() {
    return {
      title: 'CodeBox',
      icon: '<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.71,6.29a1,1,0,0,0-1.42,0l-5,5a1,1,0,0,0,0,1.42l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,12l4.3-4.29A1,1,0,0,0,9.71,6.29Zm11,5-5-5a1,1,0,0,0-1.42,1.42L18.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5A1,1,0,0,0,20.71,11.29Z"/></svg>'
    };
  }

  static get displayInToolbox() {
    return true;
  }

  static get enableLineBreaks() {
    return true;
  }

  static get isReadOnlySupported() {
    return true;
  }

  render(){
    const codeAreaHolder = document.createElement('pre');

    codeAreaHolder.setAttribute('class', 'codeBoxHolder');
    codeAreaHolder.appendChild(this.codeArea);

    this.codeArea.setAttribute('class', `codeBoxTextArea ${ this.config.useDefaultTheme } ${ this.data.language }`);
    if (!this.readOnly)
        this.codeArea.setAttribute('contenteditable', true);
    else
        this.codeArea.setAttribute('contenteditable', false);
    this.codeArea.innerHTML = this.data.code;
    this.api.listeners.on(this.codeArea, 'focus', this._removeFormatting.bind(this), false);
    this.api.listeners.on(this.codeArea, 'blur', this._highlightCodeArea.bind(this), false);
    this.api.listeners.on(this.codeArea, 'paste', this._handleCodeAreaPaste.bind(this), false);

    hljs.highlightBlock(this.codeArea)

    return codeAreaHolder;
  }

  save(/*blockContent*/){
    return Object.assign(this.data, { code: this.codeArea.innerText, theme: this._getThemeURLFromConfig() });
  }

  validate(savedData){
    if (!savedData.code.trim()) return false;
    return true;
  }

  destroy(){
    this.api.listeners.off(this.codeArea, 'focus', this._removeFormatting.bind(this), false);
    this.api.listeners.off(this.codeArea, 'blur', this._highlightCodeArea.bind(this), false);
    this.api.listeners.off(this.codeArea, 'paste', this._handleCodeAreaPaste.bind(this), false);
  }

  _removeFormatting() {
    this.codeArea.innerHTML = this.codeArea.innerText
  }

  _highlightCodeArea(/*event*/){
    this._removeFormatting();
    hljs.highlightBlock(this.codeArea);
  }

  _handleCodeAreaPaste(event){
    event.preventDefault();      
    event.stopPropagation();
    this._removeFormatting();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand('insertHTML', false, text);
  }

  _getThemeURLFromConfig(){
    let themeURL = `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/atom-one-${ this.config.useDefaultTheme }.min.css`;

    if (this.config.themeName) themeURL = `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/${ this.config.themeName }.min.css`;
    if (this.config.themeURL) themeURL = this.config.themeURL;

    return themeURL;
  }
}
