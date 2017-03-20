import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { SidebarItem } from '@andes/plex/src/lib/app/sidebar-item.class';
import { MenuItem } from '@andes/plex/src/lib/app/menu-item.class';


@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {
    constructor(public plex: Plex) { }
    ngOnInit() {
        // Cargo el listado de componentes
        this.loadSideBar();
    }

    loadSideBar() {
        const items = [
            new MenuItem({ label: 'Inicio', icon: 'creation', route: '/inicio' }),
            new MenuItem({ label: 'Organizacion', icon: 'hospital-building', route: '/organizacion' }),
            new MenuItem({ label: 'Profesional', icon: 'account-circle', route: '/profesional' }),
            new MenuItem({ label: 'Especialidad', icon: 'certificate', route: '/especialidad' }),
            new MenuItem({ label: 'Paciente', icon: 'seat-recline-normal', route: '/paciente' }),
            new MenuItem({ label: 'Espacio Físico', icon: 'view-agenda', route: '/espacio_fisico' }),
            new MenuItem({ label: 'Prestacion', icon: 'blur', route: '/prestacion' }),
            new MenuItem({ label: 'Agendas', icon: 'calendar', route: '/agenda' }),
            new MenuItem({ label: 'Turnos', icon: 'calendar-check', route: '/turnos' }),
            new MenuItem({ label: 'Lista de Espera', icon: 'calendar-check', route: '/listaEspera' }),
            new MenuItem({ label: 'Gestor Agendas', icon: 'calendar-check', route: '/gestor_agendas' }),
            new MenuItem({ label: 'rup Prestaciones', icon: 'calendar-check', route: '/rup' }),
            new MenuItem({ label: 'Tipo de Prestaciones', icon: 'blur', route: '/tipoprestaciones' }),
        ];
        this.plex.initStaticItems(items);
    }
}
