import {html, css, LitElement} from 'https://esm.run/lit';
import './collapsibleItem.js'

const BUILDINGS = {
   HB: 0,
   NB: 1,
   GW: 2
}

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
    modus: {type: Object}
  };

  constructor() {
    super();
    this.data = {};
    this.modus = MODUS[0]
    this.getData();
  }
  getData(filterKey) {
      fetch('artists.json').then(response=>{
         if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
         }
         return response.json();  
      }).then(data =>{
         if (filterKey && filterKey != '' && this.modus.type == MODI.ARTIST) {
            data.artists = data.artists.filter(item =>item.Name.toUpperCase().startsWith(filterKey) || item.Vorname.toUpperCase().startsWith(filterKey))
         }
         data.locations = this.__createLocations(data.artists, filterKey, (this.modus.type == MODI.LOCATION));
         this.data = data;
      }).catch(error => console.error('Failed to fetch data:', error));
  }
  __createLocations(artists, filterKey, isLocationModus) {
      let locations = {};
      if (isLocationModus && filterKey && filterKey != '') {
          artists.forEach( artist =>{
            artist.Objekte.forEach(obj =>{
               if (obj.Location.toUpperCase().startsWith(filterKey)) {
                  if (!(obj.Location in locations)) {
                     locations[obj.Location] = [];
                  }
                  if (locations[obj.Location].filter(currentArtist =>currentArtist.ID == artist.ID).length == 0){
                     locations[obj.Location].push(this.__filterArtist(artist, obj.Location))
                  }
               }
            });
         });
      } else {
         artists.forEach( artist =>{
            artist.Objekte.forEach(obj =>{
               if (!(obj.Location in locations)) {
                  locations[obj.Location] = [];
               }
               if (locations[obj.Location].filter(currentArtist =>currentArtist.ID == artist.ID).length == 0){
                  locations[obj.Location].push(this.__filterArtist(artist, obj.Location))
               }
            });
         });
      }
      let locationArray = [];
      for (const [key, value] of Object.entries(locations)) {
         locationArray.push({ location: key, artists: value, sortLnu: this.__getSortLnu(key) })
      }
      return locationArray.sort((a, b) => (a.sortLnu < b.sortLnu) ? -1 : 1);
  }
  __getSortLnu(locationStr) {
      const locArray = locationStr.split('.');
      if (locArray.length < 2) {
         return BUILDINGS[locArray[0]]
      }
      const second = (isNaN(locArray[1])) ? '0' : locArray[1]
      const third = (locArray.length < 3 || isNaN(locArray[1])) ? '0' : locArray[2]
      return BUILDINGS[locArray[0]] + second + third
  }
  __filterArtist(artist, objLocation) {
      let clonedArtist = structuredClone(artist)
      clonedArtist.Objekte = clonedArtist.Objekte.filter(obj =>obj.Location == objLocation) 
      return clonedArtist
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
  __cancel(e) {
      if (e.target && e.target.dataset.target){
         this.__resetInput(e.target)
      }
      this.getData();
  }
  __resetInput(button) {
      button.classList.add('hidden')
      const input = this.renderRoot?.querySelector(button.dataset.target)
      if (input) {
         input.value = '';
      }
  }
  __changeModus(e) {
     this.modus = MODUS[e.target.value];
     const button = this.renderRoot?.querySelector(e.target.dataset.target)
     if (button) {
        this.__resetInput(button);
     }
  }
  __renderContent() {
      return (this.modus.type == MODI.ARTIST) 
      ?   html` ${this.data.artists.map(artist => html`<collapsible-item .artist="${artist}"></collapsible-item>`)}`
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
                                          ?checked=${this.modus.type == modus.type}> 
                                          <label for=${modus.label}>${modus.placeholder}</label>`)}
            <div class="status">Letzte &Auml;nderung: ${this.__lastUpdate()} <span class="testData">${this.__printTestStatus()}</span></div>
         </div>
      </div>
      <p>${this.__renderContent()}</p>`;
    } 
  }
}
customElements.define('artist-on-view', ArtistsOnView);
