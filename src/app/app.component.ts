import { Component } from '@angular/core';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { SidebarItem } from 'andes-plex/src/lib/app/sidebar-item.class';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(public plex: PlexService) { }
    ngOnInit() {
        //Cargo el listado de componentes
        this.loadSideBar();
    }

    loadSideBar() {
        let items = [
        new SidebarItem('Inicio', 'creation', '/inicio'),
        new SidebarItem('Organizacion', 'hospital-building', '/organizacion'),
        new SidebarItem('Profesional', 'human-male', '/profesional'),
        new SidebarItem('Especialidad', 'certificate', '/especialidad'),
        new SidebarItem('Paciente', 'seat-recline-normal', '/paciente'),
        new SidebarItem('Plantillas', 'calendar-clock', '/plantillas')
        ];
        this.plex.initStaticItems(items);
    }
}