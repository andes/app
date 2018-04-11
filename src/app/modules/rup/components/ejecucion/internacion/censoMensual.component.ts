import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { CamasService } from '../../../../../services/camas.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import * as moment from 'moment';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
    templateUrl: 'censoMensual.html'
})

export class CensoMensualComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public fechaHasta;
    public organizacionSeleccionada;
    public listadoCenso = [];
    public ingresoEgreso = {};
    public resumenCensoTotal;

    public snomedEgreso = {
        conceptId: '58000006',
        term: 'alta del paciente',
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento'
    };


    public resumenCenso = {
        existencia0: 0,
        ingresos: 0,
        pasesDe: 0,
        egresosAlta: 0,
        egresosDefuncion: 0,
        pasesA: 0,
        existencia24: 0,
        ingresoEgresoDia: 0,
        pacientesDia: 0,
        disponibles24: 0,
        disponibles0: 0
    };

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
        let params = {
            fechaDesde: moment(this.fecha).endOf('day'),
            fechaHasta: moment(this.fechaHasta).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getCensoMensual(params).subscribe((respuesta: any) => {
            this.resumenCensoTotal = respuesta;
            // this.completarResumenDiario();
        });
    }

    reseteaBusqueda() {
        this.listadoCenso = [];
    }



}
