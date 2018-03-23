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
            this.listadoCenso = respuesta;

            console.log(this.listadoCenso);
            this.completarIngresosEgresos();

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




    // esPaseDe(pases) {
    //     debugger;
    //     if (pases && pases.length > 1) {
    //         let fechaInicio = moment(this.fecha).startOf('day').toDate();
    //         let fechaFin = moment(this.fecha).endOf('day').toDate();
    //         let ultimoPase = pases[pases.length - 1];
    //         let paseAnterior = pases[pases.length - 2];
    //         console.log(paseAnterior, 'paseAnterior')
    //         if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
    //             if (paseAnterior.estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
    //                 return paseAnterior.estados;
    //             } else {
    //                 if (pases[pases.length - 3]) {

    //                     return pases[pases.length - 3].estados;
    //                 }

    //                 // VER que el pase de seria el anterior al que estamos mirando.
    //             }
    //         }
    //     }
    //     return null;
    // }

    esPaseA(pases) {
        debugger;
        if (pases && pases.length > 1) {
            let fechaInicio = moment(this.fecha).startOf('day').toDate();
            let fechaFin = moment(this.fecha).endOf('day').toDate();
            // // debugger;
            // let ultimoPase = pases[pases.length - 1];
            // let paseAnterior = pases[pases.length - 2];

            let ultimoIndice = -2;
            // pases.forEach((p, i) => {
            //     if (p.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
            //         ultimoIndice = i;
            //     }
            // });
            ultimoIndice = pases.findIndex(p =>
                p.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId
                && p.estados.fecha > fechaInicio
            );
            let ultimoPase = null;
            let pasePosterior = null;

            if (ultimoIndice === pases.length - 1 && (pases[ultimoIndice - 2].estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId)) {
                ultimoPase = pases[ultimoIndice];
                pasePosterior = pases[ultimoIndice - 1];
            } else {
                ultimoPase = pases[ultimoIndice];
                pasePosterior = pases[ultimoIndice + 1];
            }


            if (ultimoPase.estados.fecha >= fechaInicio && ultimoPase.estados.fecha <= fechaFin) {
                if (ultimoPase.estados.unidadOrganizativa.conceptId === this.organizacionSeleccionada.conceptId) {
                    // if (ultimoPase.estados.unidadOrganizativa.conceptId !== this.organizacionSeleccionada.conceptId) {
                    return pasePosterior.estados;
                    // }
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


    completarIngresosEgresos() {
        // filtrar los pases interServicio
        // let listadoDefinitivo = [];
        // this.listadoCenso.forEach(unCenso => {
        //     let camaRepetida = listadoDefinitivo.find(e => e.ultimoEstado.idInternacion === e.ultimoEstado.idInternacion);
        //     if (camaRepetida) {
        //         if (camaRepetida.ultimoEstado.unidadOrganizativa.conceptId !== unCenso.ultimoEstado.unidadOrganizativa.conceptId) {
        //             listadoDefinitivo.push(unCenso);
        //         }
        //     } else {
        //         listadoDefinitivo.push(unCenso);
        //     }
        // });

        // this.listadoCenso = listadoDefinitivo;
        this.listadoCenso.forEach((censo, indice) => {
            console.log(indice, 'indice');
            censo.pases = censo.pases.filter(p => { return p.estados.fecha <= moment(this.fecha).endOf('day').toDate(); });

            let internacion = this.listadoCenso[indice].internacion;

            // console.log(internacion, 'internacion')
            // if (this.comprobarEgreso(internacion) === '') {

            // }


            this.ingresoEgreso[indice] = {};
            this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
            this.ingresoEgreso[indice]['esIngreso'] = this.esIngreso(censo.pases);
            this.ingresoEgreso[indice]['esPaseDe'] = this.esPaseDe(censo.pases);
            this.ingresoEgreso[indice]['esPaseA'] = this.esPaseA(censo.pases);
            // debugger;
            if (this.ingresoEgreso[indice]['esIngreso'] && this.ingresoEgreso[indice]['esPaseDe']) {
                let index = censo.pases.findIndex(p => p.estados._id === this.ingresoEgreso[indice]['esPaseDe']._id);
                let pases1 = censo.pases.slice(0, (index + 1));
                let pases2 = censo.pases.slice(index, censo.pases.length);
                censo.pases = pases1;
                let nuevoCenso = Object.assign({}, censo);
                nuevoCenso.pases = pases2;
                this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
                this.ingresoEgreso[indice]['esIngreso'] = this.esIngreso(censo.pases);
                this.ingresoEgreso[indice]['esPaseDe'] = this.esPaseDe(censo.pases);
                this.ingresoEgreso[indice]['esPaseA'] = this.esPaseA(censo.pases);
                this.listadoCenso.push(nuevoCenso);
                this.ingresoEgreso[this.listadoCenso.length - 1] = {};
                this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
                this.ingresoEgreso[this.listadoCenso.length - 1]['esIngreso'] = this.esIngreso(nuevoCenso.pases);
                this.ingresoEgreso[this.listadoCenso.length - 1]['esPaseDe'] = this.esPaseDe(nuevoCenso.pases);
                this.ingresoEgreso[this.listadoCenso.length - 1]['esPaseA'] = this.esPaseA(nuevoCenso.pases);
            }
            if (!this.ingresoEgreso[indice]['esIngreso'] && this.ingresoEgreso[indice]['esPaseA'] && this.ingresoEgreso[indice]['esPaseDe']) {
                console.log(this.ingresoEgreso[indice]['esPaseA'].fecha);
                console.log(this.ingresoEgreso[indice]['esPaseDe'].fecha);
                if (this.ingresoEgreso[indice]['esPaseA'].fecha < this.ingresoEgreso[indice]['esPaseDe'].fecha) {
                    console.log('ENTROIF');


                    let index = censo.pases.findIndex(p => p.estados._id === this.ingresoEgreso[indice]['esPaseA']._id);
                    let pases1 = censo.pases.slice(0, (index + 1));
                    let pases2 = censo.pases.slice(index, censo.pases.length);
                    censo.pases = pases1;
                    let nuevoCenso = Object.assign({}, censo);
                    nuevoCenso.pases = pases2;
                    this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
                    this.ingresoEgreso[indice]['esIngreso'] = this.esIngreso(censo.pases);
                    this.ingresoEgreso[indice]['esPaseDe'] = this.esPaseDe(censo.pases);
                    this.ingresoEgreso[indice]['esPaseA'] = this.esPaseA(censo.pases);
                    this.listadoCenso.push(nuevoCenso);
                    this.ingresoEgreso[this.listadoCenso.length - 1] = {};
                    this.ingresoEgreso[indice]['egreso'] = this.comprobarEgreso(internacion, censo.pases);
                    this.ingresoEgreso[this.listadoCenso.length - 1]['esIngreso'] = this.esIngreso(nuevoCenso.pases);
                    this.ingresoEgreso[this.listadoCenso.length - 1]['esPaseDe'] = this.esPaseDe(nuevoCenso.pases);
                    this.ingresoEgreso[this.listadoCenso.length - 1]['esPaseA'] = this.esPaseA(nuevoCenso.pases);
                }
            }

        });


    }


    reseteaBusqueda() {
        this.listadoCenso = [];
    }

}
