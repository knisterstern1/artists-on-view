const NEW_IS_LESS_THAN = 1000*60*60*24*30
const BUILDINGS = {
   HB: "0",
   NB: "1",
   GW: "2",
   HBE: "0",
   HBZ: "1",
   HB1: "2",
   HB2: "3",
   NBU: "0",
   NBUG: "0",
   HBEgrosserAussenhof: "0",
   HBEFoyer: "1",
   HBEkleinerAussenhof: "2",
   HBEkleinerHofumgang: "2",
   HB1Foyer: "00",
   HB1grosserHofumgangWest: "001",
   HB1grosserHofumgangNord: "002",
   HB1grosserHofumgangOst: "003",
   HB1kleinerHofumgangOst: "004",
   HB1kleinerHofumgangSud: "005",
   HB1kleinerHofumgangWest: "006",
   HB2Foyer: "0",
   NBUG05DurchgangHBNB: "0",
   NBFoyer: "1",
   NBE: "1",
   NB1: "2",
   NB2: "3",
   GWFoyer: "1"
}
const SAMMLUNG_ONLINE = {
   link: "https://sammlungonline.kunstmuseumbasel.ch/eMP/eMuseumPlus",
   options: { service: 'ExternalInterface', module: 'collection', viewType: 'detailView' },
   objIDKey: 'objectId'
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
export function getSammlungOnlineLink(obj) {
   let options = [ SAMMLUNG_ONLINE.objIDKey + '=' + obj.ObjID ];
   for (const [key, value] of Object.entries(SAMMLUNG_ONLINE.options)){
      options.push(key + "=" + value);
   }
   return SAMMLUNG_ONLINE.link + '?' + options.join('&');
}
export function filterArtist(artist, objLocation) {
      let clonedArtist = structuredClone(artist)
      clonedArtist.Objekte = clonedArtist.Objekte.filter(obj =>obj.Location == objLocation) 
      return clonedArtist
}
export function isLocationNew(dateString) {
      let dateArray = dateString.split(".");
      return (Date.now() - Date.parse(dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0])) < NEW_IS_LESS_THAN
}

function __getSortLnu(locationStr) {
   const locArray = locationStr.split('.');
   const first = (locArray.length == 0 || !(locArray[0] in BUILDINGS)) ? '0' : BUILDINGS[locArray[0]];
   if (locArray.length < 2) {
      return first 
   }
   let key = (locArray[0] + locArray[1]).replaceAll(' ','').replaceAll('-','').replaceAll('ü','u');
   const second = (!(key in BUILDINGS)) ? locArray[1] : BUILDINGS[key];
   if (locArray.length < 3) {
      return first + second;
   }
   key = (key + locArray[2]).replaceAll(' ','').replaceAll('-','').replaceAll('ü','u');
   const third = (!(key in BUILDINGS)) ? locArray[2] : BUILDINGS[key];
   const sortLnu = first + second + third
   return sortLnu 
}
