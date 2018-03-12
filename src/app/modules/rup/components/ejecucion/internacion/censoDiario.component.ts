import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { CamasService } from '../../../../../services/camas.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import * as moment from 'moment';


@Component({
    templateUrl: 'censoDiario.html'
})


export class CensoDiarioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public organizacionSeleccionada;
    public listadoCenso = [];


    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private organizacionService: OrganizacionService,
        private servicioInternacion: InternacionService) { }

    ngOnInit() {

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
    }

    generarCenso() {
        console.log(this.organizacionSeleccionada);
        let params = {
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getInfoCenso(params).subscribe(respuesta => {
            this.listadoCenso = respuesta;
        });
    }
}