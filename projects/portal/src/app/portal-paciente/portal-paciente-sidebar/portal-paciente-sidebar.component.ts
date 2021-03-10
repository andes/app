import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AgendaService } from '../../servicios/agenda.service';
import { Agenda } from '../../modelos/agenda';

@Component({
    selector: 'app-plex-portal-paciente-sidebar',
    templateUrl: './portal-paciente-sidebar.component.html',
})
export class PortalPacienteSidebarComponent implements OnInit {

    public listadoAgenda: Agenda[];
    // public items: DropdownItem[];
    public modelo1;
    public templateModel2;
    public opciones: any[];
    public tModel;
    agenda$: Observable<Agenda>;

    constructor(
        private agendaService: AgendaService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        // plex-dropdown
        // this.items = [
        //    {
        //        label: 'opcion 1',
        //        icon: 'star',
        //        route: 'https://ui.andes.gob.ar',
        //        handler: (() => {
        //            alert('Este es un handler');
        //        })
        //    }
        // ];

        // plex-datetime
        this.tModel = {
            fechaHora: null,
            fecha: null,
            hora: null,
            horados: null,
            disabled: false,
            min: new Date(1970, 0, 1),
            minHora: moment().add(30, 'minutes'),
            maxHora: moment().add(180, 'minutes'),
            fechaDecounce: new Date(1970, 0, 1),
        };


        // plex-select
        this.opciones = [{
            id: 1,
            nombre: 'Argentina',
            continente: 'Latinoamerica',
        },
        {
            id: 2,
            nombre: 'Brasil',
            continente: 'Latinoamerica',
        },
        {
            id: 3,
            nombre: 'Hospital Provincial Neuquen "Dr. Eduardo Castro Rendón"',
            continente: 'Latinoamerica',
        }];

        // plex-text
        this.templateModel2 = { nombre: null, min: 10, max: 15 };
    }
}
