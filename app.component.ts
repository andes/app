import {
    Component
} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<h1>ANDES :: INICIO</h1> 
              <nav>
                <a routerLink="/establecimiento" routerLinkActive="active">Establecimientos</a>
                <a routerLink="/profesional" routerLinkActive="active">Profesionales</a>
                <a routerLink="/especialidad" routerLinkActive="active">Especialidades</a>
                </nav>
                <router-outlet></router-outlet><br />
               `
})
export class AppComponent {}