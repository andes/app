import { Component, OnInit, ViewEncapsulation, HostBinding, ViewChildren, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Input, Output, EventEmitter } from '@angular/core';

import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { CamasService } from '../services/camas.service';
import * as enumerados from '../../../../utils/enumerados';
import { ResumenInternacionComponent } from './resumenInternacion.component';
import { Subject } from 'rxjs';

// ../../../../services/internacion.service
@Component({
    selector: 'app-pases-listado-internacion',
    templateUrl: './pasesListadoInternacion.html',
    styleUrls: [
        'listado-internacion.scss',
        'mapa-de-camas.component.scss'
    ],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class PasesListadoInternacionComponent implements OnInit {
    // Propiedades privadas

    // Propiedades públicas
    public organizacion: any;
    public opcionDesocupar = null;
    public elegirDesocupar = true;
    public fecha = new Date();
    public hora = new Date();
    public opcionesDesocupar = [
        { id: 'movimiento', label: 'Cambiar de cama' }];

    public listaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public PaseAunidadOrganizativa: any;
    public camaSeleccionPase;
    public listaPasesCama = [];
    public actualizaTipo = new Subject();


    // Eventos
    // cama sobre la que estamos trabajando
    @Input() cama: any;
    @Input() workflowC;
    // Internacion (prestacion) que está ocupando la cama
    @Input() prestacion: any;

    // resultado de la accion realizada sobre la cama
    @Output() cancelarPases: EventEmitter<any> = new EventEmitter<any>();
    @Output() verInternacionEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();


    // Constructor
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        public organizacionService: OrganizacionService,
        private internacionService: InternacionService, public prestacionesService: PrestacionesService, public CamaService: CamasService) {

        this.actualizaTipo
            .debounceTime(1000)
            .subscribe(val => {
                this.operacionDesocuparCama();
            });

    }

    // Métodos (privados y públicos)

    ngOnInit() {

        // controlamos que llegue una cama y una prestación
        if (this.prestacion) {
            this.opcionDesocupar = null;
            this.elegirDesocupar = true;
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                this.organizacion = organizacion;
                const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
                this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
                    let listaFiltrada = lista.filter(c => c.estados.fecha < fechaMovimiento);
                    this.camasService.getCama(listaFiltrada[listaFiltrada.length - 1]._id).subscribe(cama => {
                        this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== cama.ultimoEstado.unidadOrganizativa.conceptId) : [];
                        if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 0) {
                            this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad organizativa' });
                        }
                    });
                });
                // vamos a cargar los movimientos de la internación para luego hacer los filtros correspondientes
                // segun la cama ocupada en la fecha seleccionada
                this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
                    this.listaPasesCama = lista;
                });
            });
        } else {

        }

    }



    filtrosDesocupar() {
        const fechaActual = new Date();
        const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
        if (fechaMovimiento > fechaActual) {
            this.plex.info('danger', 'La fecha y hora del movimiento no puede ser superior a la fecha actual', 'Error');
            return false;
        }
        // vamos a buscar la fecha de ingreso del paciente y a comprobar que la fecha del movimiento se
        // realiza entre las fecha de ingreso o egreso (esta última en caso que ya esté registrada)
        const ingreso = this.internacionService.verRegistro(this.prestacion, 'ingreso');
        const egreso = this.internacionService.verRegistro(this.prestacion, 'egreso');
        if (!ingreso || (ingreso && ingreso.informeIngreso.fechaIngreso > fechaMovimiento)) {
            this.plex.info('danger', 'La fecha y hora del movimiento no puede ser menor a la fecha de ingreso del paciente', 'Error');
            return false;
        }

        if (egreso) {
            if (egreso.InformeEgreso.fechaEgreso < fechaMovimiento) {
                this.plex.info('danger', 'La fecha y hora del movimiento no puede ser mayor a la fecha de egreso del paciente', 'Error');
                return false;
            }
        }

        return true;
    }

    /**
     * Busca entre los pases de la internacion la cama que ocupaba en la fecha seleccionada
     */
    private buscarCamaOcupada() {
        if (this.filtrosDesocupar()) {
            let fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
            let listaFiltrada = this.listaPasesCama.filter(c => c.estados.fecha <= fechaMovimiento);
            if (listaFiltrada && listaFiltrada.length > 0) {
                const camaOcupada = listaFiltrada[listaFiltrada.length - 1];
                return camaOcupada;
            }
        }
        return null;
    }



    /**
     * Realizar los cambios de estado usando los datos del formulario y emitir el dato guardado
     *
     * @param {any} $event formulario a validar
     * @memberof TemplateFormComponent
     */

    public desocuparCama(event) {
        if (event.formValid) {
            if (this.filtrosDesocupar()) {
                if (!this.internacionService.usaWorkflowCompleto(this.auth.organizacion.id) && !this.camaSeleccionPase) {
                    this.plex.info('danger', 'Debe seleccionar una cama disponible', 'Error');
                    return false;
                }
                // buscamos la cama en la que estaba internado el paciente en la fecha seleccionada
                this.cama = this.buscarCamaOcupada();
                let paciente = this.cama.estados.paciente;
                let idInternacion = this.cama.estados.idInternacion;
                if (this.opcionDesocupar === 'movimiento' || this.opcionDesocupar === 'pase') {
                    let nuevoEstado = this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible';
                    const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
                    // Primero desocupamos la cama donde esta el paciente actualmente
                    this.camasService.cambioEstadoMovimiento(this.cama._id, this.cama.estados, nuevoEstado, fechaMovimiento, null, null, this.PaseAunidadOrganizativa).subscribe(camaActualizada => {
                        if (this.camaSeleccionPase) {
                            const filtroEstado = this.camaSeleccionPase.estados.filter(c => c.fecha < fechaMovimiento);
                            const ultimoEstado = filtroEstado[filtroEstado.length - 1];
                            // Si hay que hacer un movimiento o pase de cama cambiamos el estado de la cama seleccionada a ocupada
                            this.camasService.cambioEstadoMovimiento(this.camaSeleccionPase.id, ultimoEstado, 'ocupada', fechaMovimiento, paciente, idInternacion,
                                this.PaseAunidadOrganizativa).subscribe(camaCambio => {
                                    this.camaSeleccionPase.ultimoEstado = camaCambio.ultimoEstado;
                                    this.opcionDesocupar = null;
                                    this.elegirDesocupar = true;
                                    this.verInternacionEmit.emit(true);

                                }, (err1) => {
                                    this.plex.info('danger', err1, 'Error');
                                });
                        } else {
                            this.plex.info('warning', 'Paciente ingresado a lista de espera');
                        }


                    }, (err) => {
                        this.plex.info('danger', err, 'Error');
                    });

                }
            }
        }
    }

    operacionDesocuparCama() {
        if (this.opcionDesocupar === 'movimiento' || this.opcionDesocupar === 'pase') {
            this.listadoCamas = null;
            this.elegirDesocupar = false;
            this.cama = this.buscarCamaOcupada();
            if (this.cama) {
                let unidadOrganizativa = this.cama.estados.unidadOrganizativa;
                this.selectCamasDisponibles(unidadOrganizativa.conceptId, this.fecha, this.hora);
            } else {
                this.elegirDesocupar = true;
            }
        }
    }

    selectCamasDisponibles(unidadOrganizativa, fecha, hora) {
        this.camaSeleccionPase = null;
        this.listadoCamas = null;
        let f = this.internacionService.combinarFechas(fecha, hora);
        if (this.filtrosDesocupar()) {
            if (unidadOrganizativa) {
                this.camasService.getCamasXFecha(this.auth.organizacion.id, f).subscribe(resultado => {
                    if (resultado) {
                        let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === unidadOrganizativa);
                        this.listadoCamas = [...lista];
                    }

                });
            } else {
                this.camasService.getCamasXFecha(this.auth.organizacion.id, f).subscribe(resultado => {
                    if (resultado) {
                        let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === unidadOrganizativa);
                        this.listadoCamas = [...lista];
                    } else {
                        this.listadoCamas = [];
                    }

                });
            }
        } else {
            this.elegirDesocupar = true;
        }
    }

    cancelar() {
        this.cancelarPases.emit();
    }

}
