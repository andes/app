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
    templateUrl: 'censoDiario.html'
})

export class CensoDiarioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public organizacionSeleccionada;
    public listadoCenso = [];
    public ingresoEgreso = {};

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
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getInfoCenso(params).subscribe(respuesta => {
            this.listadoCenso = respuesta;
            this.completarResumenDiario();
        });
    }

    reseteaBusqueda() {
        this.listadoCenso = [];
    }


    completarResumenDiario() {
        this.resumenCenso = {
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
        if (this.listadoCenso) {
            Object.keys(this.listadoCenso).forEach(indice => {
                this.resumenCenso.disponibles24 += 1;
                this.resumenCenso.existencia24 += 1;
                if (this.listadoCenso[indice]['esIngreso']) {
                    this.resumenCenso.ingresos += 1;
                }
                if (!this.listadoCenso[indice]['esIngreso'] && !this.listadoCenso[indice]['esPaseDe']) {
                    this.resumenCenso.existencia0 += 1;
                }

                if (this.listadoCenso[indice]['esPaseDe']) {
                    this.resumenCenso.pasesDe += 1;
                }

                if (this.listadoCenso[indice]['esPaseA']) {
                    this.resumenCenso.pasesA += 1;
                }

                if (this.listadoCenso[indice]['egreso'] !== '') {
                    if (this.listadoCenso[indice]['egreso'] === 'Defunción') {
                        this.resumenCenso.egresosDefuncion += 1;
                    } else {
                        this.resumenCenso.egresosAlta += 1;
                    }
                    if (this.listadoCenso[indice]['esIngreso']) {
                        this.resumenCenso.ingresoEgresoDia += 1;
                    }
                }
            });
            this.resumenCenso.pacientesDia = this.resumenCenso.existencia0 +
                this.resumenCenso.ingresos + this.resumenCenso.pasesDe -
                this.resumenCenso.egresosDefuncion - this.resumenCenso.egresosAlta;

            this.resumenCenso.existencia24 = this.resumenCenso.existencia24 -
                this.resumenCenso.egresosDefuncion - this.resumenCenso.egresosAlta - this.resumenCenso.pasesA;

        }

        let params = {
            fecha: this.fecha,
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getCamaDisponibilidadCenso(params).subscribe((respuesta: any) => {
            if (respuesta) {
                this.resumenCenso.disponibles0 = respuesta.disponibilidad0 ? respuesta.disponibilidad0 : 0;
                this.resumenCenso.disponibles24 = respuesta.disponibilidad24 ? respuesta.disponibilidad24 : 0;
            }
        });
    }

}
