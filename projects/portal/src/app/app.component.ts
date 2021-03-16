import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'portal';
  constructor(
    private plex: Plex,
    private server: Server) {
    server.setBaseURL(environment.API);
  }
}
