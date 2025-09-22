const NEW_IS_LESS_THAN = 1000*60*60*24*30
const BUILDINGS = {
   HB: 0,
   NB: 1,
   GW: 2
}
export function createLocations(artists, filterKey, isLocationModus) {
      let locations = {};
      if (isLocationModus && filterKey && filterKey != '') {
          artists.forEach( artist =>{
            artist.Objekte.forEach(obj =>{
               if (obj.Location.toUpperCase().startsWith(filterKey)) {
                  if (!(obj.Location in locations)) {
                     locations[obj.Location] = [];
                  }
                  if (locations[obj.Location].filter(currentArtist =>currentArtist.ID == artist.ID).length == 0){
                     locations[obj.Location].push(filterArtist(artist, obj.Location))
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
                  locations[obj.Location].push(filterArtist(artist, obj.Location))
               }
            });
         });
      }
      let locationArray = [];
      for (const [key, value] of Object.entries(locations)) {
         locationArray.push({ location: key, artists: value, sortLnu: __getSortLnu(key) })
      }
      return locationArray.sort((a, b) => (a.sortLnu < b.sortLnu) ? -1 : 1);
}
export function filterArtist(artist, objLocation) {
      let clonedArtist = structuredClone(artist)
      clonedArtist.Objekte = clonedArtist.Objekte.filter(obj =>obj.Location == objLocation) 
      return clonedArtist
}
export function isLocationNew(dateString) {
      let dateArray = dateString.split(".");
   console.log('hello world');
      return (Date.now() - Date.parse(dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0])) < NEW_IS_LESS_THAN
}

function __getSortLnu(locationStr) {
      const locArray = locationStr.split('.');
      if (locArray.length < 2) {
         return BUILDINGS[locArray[0]]
      }
      const second = (isNaN(locArray[1])) ? '0' : locArray[1]
      const third = (locArray.length < 3 || isNaN(locArray[1])) ? '0' : locArray[2]
      return BUILDINGS[locArray[0]] + second + third
  }
