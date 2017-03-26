import { environment } from './../environments/environment';
import { Component, OnInit, ModuleWithProviders } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent {
    constructor(public plex: Plex, public server: Server) {
        // Configura server. Debería hacerse desde un provider (http://stackoverflow.com/questions/39033835/angularjs2-preload-server-configuration-before-the-application-starts)
        server.setBaseURL(environment.API);
     }

    // ngOnInit() {
        // const items = [
        //     new MenuItem({ label: 'Inicio', icon: 'creation', route: '/inicio' }),
        //     new MenuItem({ label: 'Organizacion', icon: 'hospital-building', route: '/organizacion' }),
        //     new MenuItem({ label: 'Profesional', icon: 'account-circle', route: '/profesional' }),
        //     new MenuItem({ label: 'Especialidad', icon: 'certificate', route: '/especialidad' }),
        //     new MenuItem({ label: 'Paciente', icon: 'seat-recline-normal', route: '/paciente' }),
        //     new MenuItem({ label: 'Espacio Físico', icon: 'view-agenda', route: '/espacio_fisico' }),
        //     new MenuItem({ label: 'Prestacion', icon: 'blur', route: '/prestacion' }),
        //     new MenuItem({ label: 'Agendas', icon: 'calendar', route: '/agenda' }),
        //     new MenuItem({ label: 'Turnos', icon: 'calendar-check', route: '/turnos' }),
        //     new MenuItem({ label: 'Lista de Espera', icon: 'calendar-check', route: '/listaEspera' }),
        //     new MenuItem({ label: 'Gestor Agendas', icon: 'calendar-check', route: '/gestor_agendas' }),
        //     new MenuItem({ label: 'rup Prestaciones', icon: 'calendar-check', route: '/rup' }),
        //     new MenuItem({ label: 'Tipo de Prestaciones', icon: 'blur', route: '/tipoprestaciones' }),
        // ];
        // this.plex.initStaticItems(items);
    // }
}
