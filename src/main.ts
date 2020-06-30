import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';
import * as bowser from 'bowser';

const timeZone = new Date().getTimezoneOffset();

// Check browser version
if (!(bowser as any).check({ chrome: '54' }) || !(bowser as any).check({ firefox: '54' })) {
  window.document.getElementById('incompatible-browser').style.display = 'block';
  window.document.getElementById('preloader').style.display = 'none';
} else if (timeZone !== 180) {
  window.document.getElementById('incompatible-timeZone').style.display = 'block';
  window.document.getElementById('preloader').style.display = 'none';
} else {
  // Enabled production mode
  if (environment.production) {
    enableProdMode();
  }
  // Start application
  platformBrowserDynamic().bootstrapModule(AppModule);
}


// function convertUTCDateToLocalDate(date) {
//   var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

//   var offset = date.getTimezoneOffset() / 60;
//   var hours = date.getHours();

//   newDate.setHours(hours - offset);

//   return newDate;   
// }
