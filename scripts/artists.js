import {html, css, LitElement} from 'https://esm.run/lit';
import './collapsibleItem.js'

export class ArtistsOnView extends LitElement {
  //static styles = css`p { color: blue }`;

  static properties = {
    data: {type: Object}
  };

  constructor() {
    super();
    this.data = {}
    this.getData();
  }
  getData() {
      fetch('artists.json').then(response=>{
         if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
         }
         return response.json();  
      }).then(data =>{
         this.data = data;
      }).catch(error => console.error('Failed to fetch data:', error));
  }

  render() {
    if (this.data.status && this.data.status == 'success') {
      return html`
      <p>
         ${this.data.artists.map(i => html`<collapsible-item .artist="${i}"></collapsible-item>`)}
      </p>`;
    } 
  }
}
customElements.define('artist-on-view', ArtistsOnView);
