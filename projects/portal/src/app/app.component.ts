import { Component } from '@angular/core';
import { Plex} from '@andes/plex';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'portal';
  constructor(private plex: Plex) {
  }
}
