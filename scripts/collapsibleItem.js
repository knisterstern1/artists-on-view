import {html, css, LitElement} from 'https://esm.run/lit';

export class CollapsibleItem extends LitElement {
  static styles = css`
  .accordion { 
     cursor: pointer;
     transition: 0.4s;}
  .accordion:hover { background: #f9f9f9 ; }
  .accordion-header:after {
     content: '\\02795'; 
     font-size: 13px;
      color: #777;
     float: right;
     margin-left: 5px;
   }
   .active:after {
      content: '\\2796';
   }
  td.location { padding-left: 20px; }
  .hidden { display: none }`;

  static properties = {
    artist: {type: Object},
    location: {type: Object}
  };

  constructor() {
    super();
    this.artist = null;
    this.location = null;
  }

  artistInfo(artist){
     if (artist.Lebensdaten) {
         return artist.Vorname + " " + artist.Name + " (" + artist.Lebensdaten + ")"
      }
      return artist.Vorname + " " + artist.Name
  }

  __itemClicked(e) {
      const item = this.renderRoot?.querySelector('#hiddenItem')
      const header = this.renderRoot?.querySelector('#header')
      if (item && header) {
         item.classList.toggle('hidden')
         header.classList.toggle('active')
      }
  }

  render() {
    if (this.artist) {
      return html`
      <div class="accordion" @click=${this.__itemClicked}>
         <h3 id="header" class="accordion-header">${this.artistInfo(this.artist)}</h3>
         <div id="hiddenItem" class="hidden">
            <table> 
            ${this.artist.Objekte.map(obj => html`<tr><td>&quot;${obj.Titles}&quot;</td><td class="location">${obj.Location}</td></tr>`)}
            </table>
         </div>
      </div>`;
    } else if (this.location) {
      return html`
      <div class="accordion" @click=${this.__itemClicked}>
         <h3 id="header" class="accordion-header">${this.location.location}</h3>
         <div id="hiddenItem" class="hidden">
           ${this.location.artists.map(artist =>
              html`<h4>${this.artistInfo(artist)}</h4>
                   ${artist.Objekte.map(obj => html`<div>&quot;${obj.Titles}&quot;</div>`)}
                  `)}     
         </div>
      </div>`;
    }
  }
}
customElements.define('collapsible-item', CollapsibleItem);
