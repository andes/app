import { element } from 'protractor';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';

import { EstadosAgenda } from './../../turnos/enums';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})
export class PuntoInicioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Lista de agendas filtradas por fecha, tipos de prestaciones permitidas, ...
    public agendas: IAgenda[] = [];
    // Agenda seleccionada
    public agendaSeleccionada;
    // Mostrar sólo mis agendas
    public soloMisAgendas = true;
    // Lista de prestaciones filtradas por fecha, tipos de prestaciones permitidas, ...
    public prestaciones: any = [];
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Prestaciones que están fuera de la agenda
    public fueraDeAgenda: any = [];
    // estados a utilizarse en la agenda
    public estadosAgenda = EstadosAgenda;


    // FILTROS
    private agendasOriginales: any = [];
    private prestacionesOriginales: any = [];
    public prestacionSeleccion: any;
    public paciente: any;

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        // Carga tipos de prestaciones permitidas para el usuario
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;

            this.actualizar();
        });
    }

    /**
     * Actualiza el listado de agendas y prestaciones
     */
    actualizar() {
        Observable.forkJoin(
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: this.fecha,
                fechaHasta: this.fecha,
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada']
            }),
            // Prestaciones
            this.servicioPrestacion.get({
                fechaDesde: this.fecha,
                fechaHasta: this.fecha,
                organizacion: this.auth.organizacion.id
                // TODO: filtrar por las prestaciones permitidas, pero la API no tiene ningún opción
                // this.auth.getPermissions('rup:tipoPrestacion:?')
            })
        ).subscribe(data => {
            this.agendas = data[0];
            this.prestaciones = data[1];

            if (this.agendas.length) {
                this.agendaSeleccionada = this.agendas[0];
            }

            if (this.agendas.length) {
                // this.agendaSeleccionada = this.agendas[0];

                // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
                this.agendas.forEach(agenda => {
                    agenda['cantidadTurnos'] = 0;
                    // loopeamos los bloques de la agendas
                    agenda.bloques.forEach(bloques => {
                        agenda['cantidadTurnos'] += bloques.turnos.length;
                        // loopeamos los turnos dentro de los bloques
                        bloques.turnos.forEach(turno => {
                            let indexPrestacion = this.prestaciones.findIndex(prestacion => {
                                return (prestacion.solicitud.turno && prestacion.solicitud.turno === turno.id);
                            });
                            // asignamos la prestacion al turno
                            turno['prestacion'] = this.prestaciones[indexPrestacion];
                        });
                    });
                });

            }

            this.agendasOriginales = JSON.parse(JSON.stringify(this.agendas));

            // buscamos las que estan fuera de agenda para poder listarlas
            this.fueraDeAgenda = this.prestaciones.filter(p => (!p.solicitud.turno));

            // agregamos el original de las prestaciones que estan fuera
            // de agenda para poder reestablecer los filtros
            this.prestacionesOriginales = JSON.parse(JSON.stringify(this.fueraDeAgenda));
            // this.mostrarTurnoPendiente(this.fueraDeAgenda);
            // filtramos los resultados
            this.filtrar();

            // recorremos agenda seleccionada para ver si tienen planes pendientes y mostrar en la vista..
            if ( this.agendaSeleccionada) {
                this.agendaSeleccionada.bloques.forEach(element => {
                    element.turnos.forEach(turno => {
                        if (turno.prestacion) {
                            turno.prestacion = this.mostrarTurnoPendiente(turno.prestacion);
                        }
                    });
                });
            }
            this.fueraDeAgenda = this.mostrarTurnoPendiente(this.fueraDeAgenda);

        });
    }

    /**
     * Filtra el listado de agendas y prestaciones
     */
    filtrar() {
        // filtrar solo por las prestaciones que el profesional tenga disponibles

        this.agendas = JSON.parse(JSON.stringify(this.agendasOriginales));
        // this.agendas = this.agendasOriginales;
        this.fueraDeAgenda = this.prestacionesOriginales;

        // filtramos por agendas propias o todas menos las propias
        if (this.soloMisAgendas) {
            this.agendas = this.agendas.filter(agenda => {
                return (agenda.profesionales.find(profesional => {
                    return (profesional.id === this.auth.profesional.id);
                }));
            });
        } else {
            this.agendas = this.agendas.filter(agenda => {
                return (agenda.profesionales.find(profesional => {
                    return (profesional.id !== this.auth.profesional.id);
                }));
            });
        }

        // por tipo de prestación
        if (this.prestacionSeleccion) {
            let agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    let lengthBloques = this.agendas[indexAgenda].bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

                        let _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
                            return (t.tipoPrestacion && t.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                        });

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    }
                }
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                let _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.tipoPrestacion && p.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                });

                this.fueraDeAgenda = _turnos;
            }
        }

        if (typeof this.paciente !== 'undefined' && this.paciente) {
            let search = this.paciente.toLowerCase();

            // buscamos el paciente en los turnos de la agenda
            let agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    let lengthBloques = this.agendas[indexAgenda].bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

                        let _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
                            let nombreCompleto = '';
                            if (t.paciente) {
                                nombreCompleto = t.paciente.apellido + ' ' + t.paciente.nombre;
                            }
                            return (t.paciente &&
                                (nombreCompleto.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.nombre.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.documento.toLowerCase().indexOf(search) >= 0)
                            );
                        });

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    }
                }
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                let _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.paciente &&
                        (p.paciente.nombre.toLowerCase().indexOf(search) >= 0 || p.paciente.apellido.toLowerCase().indexOf(search) >= 0
                            || p.paciente.documento.toLowerCase().indexOf(search) >= 0));
                });

                this.fueraDeAgenda = _turnos;
            }
        }


        if (this.agendas.length) {
            this.agendaSeleccionada = this.agendas[0];
        }

    }

    /**
     * Navega para crear una nueva prestación
     */
    crearPrestacion() {
        this.router.navigate(['/rup/crear']);
    }

    iniciarPrestacion(paciente, snomedConcept, turno) {
        this.servicioPrestacion.crearPrestacion(paciente, snomedConcept, 'ejecucion', new Date(), turno).subscribe(prestacion => {
            this.plex.alert('Prestación creada.').then(() => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            });
        }, (err) => {
            this.plex.toast('danger', 'ERROR: No fue posible crear la prestación');
        });
    }

    /**
     * Recorremos los bloques y los turnos de una agenda
     * y verifica si hay algun paciente agregado
     */
    getCantidadPacientes(agenda) {
        let total = 0;

        let lengthBloques = agenda.bloques.length;
        for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

            let _turnos = agenda.bloques[indexBloque].turnos.filter(t => {
                total += (t.paciente.id) ? 1 : 0;
            });
        }

        return total;
    }

    tienePermisos(tipoPrestacion) {
        let permisos = this.auth.getPermissions('rup:tipoPrestacion:?');
        let existe = permisos.find(permiso => (permiso === tipoPrestacion._id));

        return existe;
    }

    cargarTurnos(agenda) {
        this.agendaSeleccionada = agenda ? agenda : 'fueraAgenda';
    }


    routeTo(action, id) {
        this.router.navigate(['rup/' + action + '/', id]);
    }


    // Recibe un array o un objeto lo recorre y busca los planes que estan pendientes..
    mostrarTurnoPendiente(prestaciones) {
        if (Array.isArray(prestaciones)) {
            prestaciones.forEach(unaPrestacion => {
                if (unaPrestacion.estados[unaPrestacion.estados.length - 1].tipo === 'validada') {
                    this.servicioPrestacion.getByPaciente(unaPrestacion.paciente.id).subscribe(prestacionesPaciente => {
                        prestacionesPaciente.forEach(elemento => {
                            if (elemento.solicitud.prestacionOrigen === unaPrestacion.id
                                && elemento.estados[elemento.estados.length - 1].tipo === 'pendiente'
                                && !elemento.solicitud.turno) {
                                unaPrestacion.turnosPedientes = true;
                            }
                        });
                    });
                }
            });
        } else {
            if (prestaciones.estados[prestaciones.estados.length - 1].tipo === 'validada') {
                this.servicioPrestacion.getByPaciente(prestaciones.paciente.id).subscribe(prestacionesPaciente => {
                    prestacionesPaciente.forEach(elemento => {
                        if (elemento.solicitud.prestacionOrigen === prestaciones.id
                            && elemento.estados[elemento.estados.length - 1].tipo === 'pendiente'
                            && !elemento.solicitud.turno) {
                            prestaciones.turnosPedientes = true;
                        }
                    });
                });
            }
        }
        return prestaciones;
    }
}


