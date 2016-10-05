import {
    Component
} from '@angular/core';

@Component({
    selector: 'my-app',
    styleUrls:  ['css.app.component.css'],
    template: `<div class="masthead">
                <h1><img src="andes.png" width="60px" height="60px"> ANDES</h1>
                    <nav>
                        <ul class="nav nav-justified">
                            <li><a routerLink="/profesional" routerLinkActive="active">Profesional</a></li>
                            <li><a routerLink="/organizacion" routerLinkActive="active">Organizacion</a></li>
                            <li><a routerLink="/especialidad" routerLinkActive="active">Especialidad</a></li>
                            <li><a routerLink="/paciente" routerLinkActive="active">Paciente</a></li>
                        </ul>
                    </nav>
                    <div class="row">&nbsp;</div>
                    <router-outlet></router-outlet>
                </div>
                
                `
})
export class AppComponent {}