import { Component } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../environments/environment';
import { Plex } from '@andes/plex';
@Component({
    selector: 'pdp-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    constructor(
        private server: Server,
        private plex: Plex
    ) {
        this.server.setBaseURL(environment.API);
        this.plex.navVisible(false);
    }
}
