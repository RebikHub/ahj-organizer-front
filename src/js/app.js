import DnD from './dnd';
import Record from './record';
import Organizer from './organizer';
import Server from './server';
import Geo from './geolocation';

console.log('app started');

const server = new Server();
const geo = new Geo(server);
const record = new Record(server);
const dnd = new DnD(server);
const organizer = new Organizer(server);

geo.events();
record.events();
dnd.events();
organizer.events();

// (async () => {
//   if (navigator.serviceWorker) {
//     window.addEventListener('load', async () => {
//       try {
//         await navigator.serviceWorker.register('service-worker.js');
//         console.log('sw registered');
//       } catch (e) {
//         console.log(e);
//       }
//     });
//   }
// })();
