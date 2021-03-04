import { Component } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'portal';
  constructor(private plex: Plex) {

    // Inicializa la vista
    this.plex.updateTitle('ANDES | Mi Portal de Salud');

    this.plex.navVisible(false);

  }
}
