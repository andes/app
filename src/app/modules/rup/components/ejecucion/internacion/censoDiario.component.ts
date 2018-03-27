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
        disponibles24: 0
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
            this.completarIngresosEgresos();
            this.completarResumenDiario();
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

            // buscamos el ultimo pase de la UO que estamos filtrando
            let ultimoIndice = -1;
            pases.forEach((p, i) => {
                if (p.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
                    ultimoIndice = i;
                }
            });
            let ultimoPase = pases[ultimoIndice];
            let paseAnterior = pases[ultimoIndice - 1];

            // let ultimoPase = pases[pases.length - 1];
            // let paseAnterior = pases[pases.length - 2];
            // console.log(paseAnterior, 'paseAnterior');
            if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
                if (paseAnterior && paseAnterior.estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
                    return paseAnterior.estados;
                }
            }
        }
        return null;
    }

    esPaseA(pases) {
        if (pases && pases.length > 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            // // debugger;
            let ultimoPase = pases[pases.length - 1];
            let paseAnterior = pases[pases.length - 2];

            if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
                if (paseAnterior.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId &&
                    ultimoPase.estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
                    return ultimoPase.estados;
                } else {
                    let paseAux = pases[pases.length - 3];
                    if (paseAux && ultimoPase.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId && paseAux.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
                        return paseAnterior.estados;
                    }
                }
            }
        }
        return null;
    }

    comprobarEgreso(internacion, pases) {
        let fechaInicio = moment(this.fecha).startOf('day').toDate();
        let fechaFin = moment(this.fecha).endOf('day').toDate();
        let registros = internacion.ejecucion.registros;
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.snomedEgreso.conceptId);

        if (egresoExiste) {
            if (egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
                if (pases[pases.length - 1].estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
                    return egresoExiste.valor.InformeEgreso.tipoEgreso.nombre;
                }
            }

        }
        return '';
    }

    completarUnCenso(censo, indice) {
        let internacion = this.listadoCenso[indice].internacion;
        this.ingresoEgreso[indice] = {};
        this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
        this.ingresoEgreso[indice]['esIngreso'] = this.esIngreso(censo.pases);
        this.ingresoEgreso[indice]['esPaseDe'] = this.esPaseDe(censo.pases);
        this.ingresoEgreso[indice]['esPaseA'] = this.esPaseA(censo.pases);
    }

    completarIngresosEgresos() {
        // filtrar los pases interServicio (cambio de cama en un mismo servicio)
        console.log(this.listadoCenso);
        let listadoDefinitivo = [];
        this.listadoCenso.forEach(unCenso => {
            let camaRepetida = listadoDefinitivo.findIndex(e => e.ultimoEstado.idInternacion === unCenso.ultimoEstado.idInternacion);
            if (camaRepetida >= 0) {
                if (this.listadoCenso[camaRepetida].ultimoEstado.unidadOrganizativa.conceptId !== unCenso.ultimoEstado.unidadOrganizativa.conceptId) {
                    listadoDefinitivo.push(unCenso);
                } else {
                    console.log('camaRepetida', this.listadoCenso[camaRepetida]);
                    console.log('unCenso', unCenso);
                    listadoDefinitivo.splice(camaRepetida, 1, unCenso);
                }
            } else {
                listadoDefinitivo.push(unCenso);
            }
        });

        this.listadoCenso = listadoDefinitivo;
        this.listadoCenso.forEach((censo, indice) => {
            censo.pases = censo.pases.filter(p => { return p.estados.fecha <= moment(this.fecha).endOf('day').toDate(); });
            let internacion = this.listadoCenso[indice].internacion;
            this.completarUnCenso(censo, indice);

            let index = -2;
            if (this.ingresoEgreso[indice]['esIngreso'] && this.ingresoEgreso[indice]['esPaseDe']) {
                index = censo.pases.findIndex(p => p.estados._id === this.ingresoEgreso[indice]['esPaseDe']._id);
            }

            if (!this.ingresoEgreso[indice]['esIngreso'] && this.ingresoEgreso[indice]['esPaseA'] && this.ingresoEgreso[indice]['esPaseDe']) {
                if (this.ingresoEgreso[indice]['esPaseA'].fecha <= this.ingresoEgreso[indice]['esPaseDe'].fecha) {
                    index = censo.pases.findIndex(p => p.estados._id === this.ingresoEgreso[indice]['esPaseA']._id);
                }
            }

            if (index >= 0) {
                let pases1 = censo.pases.slice(0, (index + 1));
                let pases2 = censo.pases.slice(index, censo.pases.length);

                censo.pases = pases1;
                let nuevoCenso = Object.assign({}, censo);
                nuevoCenso.pases = pases2;
                this.completarUnCenso(censo, indice);
                this.listadoCenso.push(censo);
                this.completarUnCenso(nuevoCenso, this.listadoCenso.length - 1);
            }
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
            disponibles24: 0
        };
        if (this.listadoCenso && this.ingresoEgreso) {
            Object.keys(this.ingresoEgreso).forEach(indice => {
                this.resumenCenso.existencia24 += 1;
                if (this.ingresoEgreso[indice]['esIngreso']) {
                    this.resumenCenso.ingresos += 1;
                }
                if (!this.ingresoEgreso[indice]['esIngreso'] && !this.ingresoEgreso[indice]['esPaseDe']) {
                    this.resumenCenso.existencia0 += 1;
                }

                if (this.ingresoEgreso[indice]['esPaseDe']) {
                    this.resumenCenso.pasesDe += 1;
                }

                if (this.ingresoEgreso[indice]['esPaseA']) {
                    this.resumenCenso.pasesA += 1;
                }

                if (this.ingresoEgreso[indice]['egreso'] !== '') {
                    if (this.ingresoEgreso[indice]['egreso'] === 'Defunción') {
                        this.resumenCenso.egresosDefuncion += 1;
                    } else {
                        this.resumenCenso.egresosAlta += 1;
                    }
                    if (this.ingresoEgreso[indice]['esIngreso']) {
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
    }

}
