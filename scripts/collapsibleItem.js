import {html, css, LitElement} from 'https://esm.run/lit';

export class CollapsibleItem extends LitElement {
  static styles = css`
  td.location { padding-left: 20px; }
  .hidden { display: none }`;

  static properties = {
    artist: {type: Object}
  };

  constructor() {
    super();
    this.artist = null;
  }

  artistInfo(){
      if (this.artist.Lebensdaten) {
         return this.artist.Vorname + " " + this.artist.Name + " (" + this.artist.Lebensdaten + ")"
      }
      return this.artist.Vorname + " " + this.artist.Name
  }

  __itemClicked(e) {
      const item = this.renderRoot?.querySelector('#hiddenItem')
      if (item) {
         item.classList.toggle('hidden')
      }
  }

  render() {
    if (this.artist) {
      return html`
      <div @click=${this.__itemClicked}>
         <h3>${this.artistInfo()}</h3>
         <div id="hiddenItem" class="hidden">
            <table> 
            ${this.artist.Objekte.map(obj => html`<tr><td>&quot;${obj.Titles}&quot;</td><td class="location">${obj.Location}</td></tr>`)}
            </table>
         </div>
      </div>`;
    } 
  }
}
customElements.define('collapsible-item', CollapsibleItem);
