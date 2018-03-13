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
    public ingresoEgreso = {};


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
            this.completarIngresosEgresos();
        });
    }

    esIngreso(pases) {
        if (pases && pases.length === 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            if (pases[0].estados.fecha >= fechaInicio && pases[0].estados.fecha <= fechaFin) {
                return true;
            } else { return false; }
        } else { return false; }
        // return false;
    }

    esPaseDe(pases) {
        if (pases && pases.length > 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            let ultimoPase = pases[pases.length - 1];
            if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
                return pases[pases.length - 2].estados.unidadOrganizativa.term;
            }
        }
        return '';
    }


    completarIngresosEgresos() {
        this.listadoCenso.forEach(censo => {
            this.ingresoEgreso[censo.ultimoEstado.idInternacion] = {};
            this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esIngreso'] = this.esIngreso(censo.pases);
            if (!this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esIngreso']) {
                this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esPaseDe'] = this.esPaseDe(censo.pases);
            }

        });
    }





}
