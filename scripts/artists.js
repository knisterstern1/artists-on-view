import {html, css, LitElement} from 'https://esm.run/lit';
import './collapsibleItem.js';
import {createLocations, filterArtist, isLocationNew} from './functions.js';


const MODI = {
   ARTIST: 0,
   LOCATION: 1
}

const MODUS = [ { type: MODI.ARTIST, placeholder: "Künstler:innen", label: "artist" },
                { type: MODI.LOCATION, placeholder: "Standorte", label: "location"  } ]

export class ArtistsOnView extends LitElement {
  static styles = css`
  div.navi { display: inline; }
  div.footer { display: inline-flex; }
  label, div.status { font-size: 11px;}
  label.info { 
      text-decoration-line: underline;
      text-decoration-style: dashed;
  }
  div.status { margin-left: 50px;}
  button { border: none; 
      font-size: 16px;
      float: right;
      margin-top: 15px;
  }
  .hidden { display: none; }
  input#nameFilter {  width: 80%; 
  background-image: url('/styles/searchicon.png');
  background-position: 10px 12px;
  background-repeat: no-repeat;
  font-size: 16px; 
  padding: 12px 20px 12px 40px; 
  border: 1px solid #ddd; 
  margin-bottom: 12px }`;

  static properties = {
    data: {type: Object},
    modus: {type: Object},
    showNewestOnly: {type: Boolean}
  };

  constructor() {
    super();
    this.data = {};
    this.modus = MODUS[0];
    this.showNewestOnly = false;
    this.getData();
  }
  getData(filterKey) {
      fetch('artists.json').then(response=>{
         if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
         }
         return response.json();  
      }).then(data =>{
         if (this.showNewestOnly) {
            data.artists.forEach(artist =>{
               artist.Objekte = artist.Objekte.filter(obj =>isLocationNew(obj.From));   
            });
            data.artists = data.artists.filter(item =>item.Objekte.length > 0)
         }
         if (filterKey && filterKey != '' && this.modus.type == MODI.ARTIST) {
            data.artists = data.artists.filter(item =>item.Name.toUpperCase().startsWith(filterKey) || item.Vorname.toUpperCase().startsWith(filterKey))
         }
         data.locations = createLocations(data.artists, filterKey, (this.modus.type == MODI.LOCATION));
         this.data = data;
      }).catch(error => console.error('Failed to fetch data:', error));
  }


  __filterNames(e) {
     if (e.target) {
         const targetKey = '#' + e.target.id;
         const buttonSelector = (e.target.value != '') ? '*[data-target=\"' + targetKey + '\"].hidden' : '*[data-target=\"' + targetKey + '\"]:not(hidden)';
         const button = this.renderRoot?.querySelector(buttonSelector)
         if (button) {
            button.classList.toggle('hidden')
         }
         this.getData(e.target.value.toUpperCase())
     }
  }
  __filterNewest(e) {
      if (e.target && e.target.dataset.target){
         this.showNewestOnly = !this.showNewestOnly;
         let textInput = this.renderRoot?.querySelector(e.target.dataset.target)
         if (textInput && textInput.value) {
            this.getData(textInput.value.toUpperCase())
         } else {
            this.getData();
         }
      }
  }
  __cancel(e) {
      if (e.target && e.target.dataset.target){
         this.__resetInput(e, true)
      }
      this.getData();
  }
  __resetInput(e, sourceIsButton) {
     let input = null;
     let button = null
     if (sourceIsButton) {
        button = e.target;
        input = this.renderRoot?.querySelector(e.target.dataset.target) 
     } else {
         button = this.renderRoot?.querySelector(e.target.dataset.target)
         input = this.renderRoot?.querySelector(button.dataset.target)
     }
     if (button) {
         button.classList.add('hidden')
     }
     if (input) {
         input.value = '';
     }
  }
  __changeModus(e) {
     this.modus = MODUS[e.target.value];
     this.__resetInput(e);
  }
  __renderContent() {
      return (this.modus.type == MODI.ARTIST) 
      ?   html` ${this.data.artists.filter(artist =>artist.Objekte.length > 0).map(artist => html`<collapsible-item .artist="${artist}"></collapsible-item>`)}`
      :   html` ${this.data.locations.map(location => html`<collapsible-item .location="${location}"></collapsible-item>`)}`
  }
  __lastUpdate() {
     if (this.data.endDate) {
        const dateArray = this.data.endDate.split('_')
        const options = {
           weekday: "long",
           year: "numeric",
           month: "long",
           day: "numeric",
         };
        let date = new Date(dateArray[0])
        if (dateArray.length > 1) {
           const timeStr = dateArray[1].replaceAll('-',':')
           date = new Date(dateArray[0] + 'T' + timeStr)
        }
        return date.toLocaleDateString("de-DE", options) + ', ' + date.toLocaleTimeString("de-DE");
     }
     return '????'
  }
  __printTestStatus() {
	return (this.data.isTestData) ? 'TESTDATEN' : ''; 
  }

  render() {
    if (this.data.status && this.data.status == 'success') {
      return html`
      <div class="navi">
         <input type="text" id="nameFilter" @keyup=${this.__filterNames} placeholder=${this.modus.placeholder}>
         <button id="cancelButton" class="hidden" data-target="#nameFilter" @click=${this.__cancel}>&#10006;</button><br>
         <div class="footer">
         ${MODUS.map(modus => html`<input data-target="#cancelButton" 
                                          type="radio" 
                                          @click=${this.__changeModus} 
                                          id=${modus.label} 
                                          name="modus" 
                                          value=${modus.type} 
                                          .checked=${this.modus.type == modus.type}> 
                                          <label for=${modus.label}>${modus.placeholder}</label>`)}
                                          <input data-target="#nameFilter"
                                                 type="radio" 
                                                 id="newest" 
                                                 @click=${this.__filterNewest} 
                                                 .checked=${this.showNewestOnly}>
                                          <label for="newest" title="Weniger als ein Monat ausgestellt" class="info">Neu gezeigt</label>
            <div class="status">Letzte &Auml;nderung: ${this.__lastUpdate()} <span class="testData">${this.__printTestStatus()}</span></div>
         </div>
      </div>
      <p>${this.__renderContent()}</p>`;
    } 
  }
}
customElements.define('artist-on-view', ArtistsOnView);
