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
            debugger;
            this.listadoCenso = respuesta;
            this.completarIngresosEgresos();

            // Buscamos internaciones repertidas y solo dejamos la ultima. 
            // Siempre que sean del mismo paciente.

        });
    }

    esIngreso(pases) {
        if (pases && pases.length >= 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            if (pases[0].estados.fecha >= fechaInicio && pases[0].estados.fecha <= fechaFin) {
                if (pases[0].estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {

                    return true;
                } else { return false; }
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
                if (pases[pases.length - 2].estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
                    return pases[pases.length - 2].estados.unidadOrganizativa.term;
                }
            }
        }
        return '';
    }

    esPaseA(pases) {
        if (pases && pases.length > 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            let ultimoPase = pases[pases.length - 1];
            let paseAnterior = pases[pases.length - 2];
            if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
                if (paseAnterior.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
                    // if (pases[pases.length - 1].estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
                    return pases[pases.length - 1].estados.unidadOrganizativa.term;
                    // }
                }
            }
        }
        return '';
    }

    comprobarEgreso(internacion) {
        let fechaInicio = moment(this.fecha).startOf('day').toDate();
        let fechaFin = moment(this.fecha).endOf('day').toDate();
        let registros = internacion.ejecucion.registros;
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.snomedEgreso.conceptId);

        this.ingresoEgreso[internacion.id]['egresoDefuncion'] = false;
        this.ingresoEgreso[internacion.id]['egresoAlta'] = false;
        if (egresoExiste) {
            if (egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
                this.ingresoEgreso[internacion.id]['egresoDefuncion'] =
                    (egresoExiste.valor.InformeEgreso.tipoEgreso.nombre === 'Defunción');
                this.ingresoEgreso[internacion.id]['egresoAlta'] =
                    (egresoExiste.valor.InformeEgreso.tipoEgreso.nombre !== 'Defunción');
            }
        }
    }


    completarIngresosEgresos() {
        this.listadoCenso.forEach(censo => {
            censo.pases = censo.pases.filter(p => { return p.estados.fecha <= moment(this.fecha).endOf('day').toDate(); });



            this.ingresoEgreso[censo.ultimoEstado.idInternacion] = {};
            this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esIngreso'] = this.esIngreso(censo.pases);
            // if (!this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esIngreso']) {
            this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esPaseDe'] = this.esPaseDe(censo.pases);
            this.ingresoEgreso[censo.ultimoEstado.idInternacion]['esPaseA'] = this.esPaseA(censo.pases);
            //}

        });


    }
    reseteaBusqueda() {
        this.listadoCenso = [];
    }

}
