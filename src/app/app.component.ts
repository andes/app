import {
    Component
} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<div class="masthead">
                <h1><img src="andes.png" width="60px" height="60px"> ANDES</h1>
                    <nav>
                        <ul class="nav nav-pills">
                            <li><a routerLink="/profesional">Profesional</a></li>
                            <li><a routerLink="/organizacion" routerLinkActive="active">Organizacion</a></li>
                            <li><a routerLink="/especialidad">Especialidad</a></li>
                            <li><a routerLink="/pacientes">Paciente</a></li>
                        </ul>
                    </nav>
                    <div class="row">&nbsp;</div>
                    <router-outlet></router-outlet>
                </div>
                `
})
export class AppComponent {}