import { estados } from './../../../../utils/enumerados';

import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { EstadosAgenda } from './../../../../components/turnos/enums';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { PacienteService } from './../../../../services/paciente.service';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';

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
        public servicioPrestacion: PrestacionesService,
        public servicePaciente: PacienteService,
        public servicioTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        // Verificamos permisos globales para rup, si no posee realiza redirect al home
        if (this.auth.getPermissions('rup:?').length <= 0) {
            this.redirect('inicio');
        }
        if (!this.auth.profesional) {
            this.redirect('inicio');
        } else {
            if (!this.auth.profesional.id) {
                this.redirect('inicio');
            } else {
                this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
                    if (data && data.length <= 0) {
                        this.redirect('inicio');
                    }
                    this.tiposPrestacion = data;
                    this.actualizar();
                });
            }
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /**
     * Actualiza el listado de agendas y prestaciones
     */
    actualizar() {
        Observable.forkJoin(
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: moment(this.fecha).isValid() ? moment(this.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.fecha).isValid() ? moment(this.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada', 'pendienteAsistencia', 'pendienteAuditoria', 'auditada'],
                tieneTurnosAsignados: true,
                tipoPrestaciones: this.auth.getPermissions('rup:tipoPrestacion:?')
            }),
            // Prestaciones
            this.servicioPrestacion.get({
                fechaDesde: this.fecha ? this.fecha : new Date(),
                fechaHasta: new Date(),
                organizacion: this.auth.organizacion.id,
                sinEstado: 'modificada'
                // TODO: filtrar por las prestaciones permitidas, pero la API no tiene ningún opción
                // tiposPrestaciones: this.auth.getPermissions('rup:tipoPrestacion:?')
            })
        ).subscribe(data => {
            this.agendas = data[0];
            this.prestaciones = data[1];

            if (this.agendas.length) {
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

                    // busquemos si hy sobreturnos para vincularlos con la prestacion correspondiente
                    if (agenda.sobreturnos) {
                        agenda.sobreturnos.forEach(sobreturno => {
                            let indexPrestacion = this.prestaciones.findIndex(prestacion => {
                                return (prestacion.solicitud.turno && prestacion.solicitud.turno === sobreturno.id);
                            });
                            // asignamos la prestacion al turno
                            sobreturno['prestacion'] = this.prestaciones[indexPrestacion];
                        });
                    }
                });

            }

            this.agendasOriginales = JSON.parse(JSON.stringify(this.agendas));
            // buscamos las que estan fuera de agenda para poder listarlas:
            // son prestaciones sin turno creadas en la fecha seleccionada en el filtro
            this.fueraDeAgenda = this.prestaciones.filter(p => (!p.solicitud.turno &&
                (p.createdAt >= moment(this.fecha).startOf('day').toDate() &&
                    p.createdAt <= moment(this.fecha).endOf('day').toDate())
                && p.estados[p.estados.length - 1].createdBy.username === this.auth.usuario.username));

            // agregamos el original de las prestaciones que estan fuera
            // de agenda para poder reestablecer los filtros
            this.prestacionesOriginales = JSON.parse(JSON.stringify(this.fueraDeAgenda));
            this.mostrarTurnoPendiente(this.fueraDeAgenda);
            // filtramos los resultados
            this.filtrar();

            if (this.agendas.length) {
                this.agendaSeleccionada = this.agendas[0];
            }

            // recorremos agenda seleccionada para ver si tienen planes pendientes y mostrar en la vista..
            if (this.agendaSeleccionada) {
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
        this.agendaSeleccionada = null;
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
                    return (p.solicitud.tipoPrestacion && p.solicitud.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                });

                this.fueraDeAgenda = _turnos;
            }
        }
        let indexResultadoBusqueda;
        if (typeof this.paciente !== 'undefined' && this.paciente) {
            let search = this.paciente.toLowerCase();

            // buscamos el paciente en los turnos de la agenda
            let agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    let lengthBloques = this.agendas[indexAgenda].bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {


                        let _turnos = [];
                        this.agendas[indexAgenda].bloques[indexBloque].turnos.forEach(t => {
                            let nombreCompleto = '';
                            if (t.paciente && t.paciente.id) {
                                nombreCompleto = t.paciente.apellido + ' ' + t.paciente.nombre;
                            }

                            if (t.paciente && t.paciente.id &&
                                (nombreCompleto.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.nombre.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.documento.toLowerCase().indexOf(search) >= 0)
                            ) {
                                // guardamos el indice de la primer agenda tenga el paciente que se busca.
                                if (indexResultadoBusqueda === undefined) {
                                    indexResultadoBusqueda = indexAgenda;
                                }
                                _turnos.push(t);
                            }
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

        if (this.agendas.length && this.paciente) {
            this.cargarTurnos(this.agendas[indexResultadoBusqueda]);
        } else {
            this.cargarTurnos(this.agendas[0]);
        }

    }

    /**
     * Navega para crear una nueva prestación
     */
    crearPrestacion(opcion: string): void {
        this.router.navigate(['/rup/crear', opcion]);
    }
    /**
    * Navega para ver seleccionar un paciente y ver la huds
    */
    verHuds() {
        this.router.navigate(['/rup/buscaHuds']);
    }

    iniciarPrestacion(paciente, snomedConcept, turno) {
        this.plex.confirm('Paciente: <b>' + paciente.apellido + ', ' + paciente.nombre + '.</b><br>Prestación: <b>' + snomedConcept.term + '</b>', '¿Crear Prestación?').then(confirmacion => {
            if (confirmacion) {
                this.servicioPrestacion.crearPrestacion(paciente, snomedConcept, 'ejecucion', new Date(), turno).subscribe(prestacion => {

                    this.routeTo('ejecucion', prestacion.id);
                }, (err) => {
                    this.plex.alert('No fue posible crear la prestación', 'ERROR');
                });
            } else {
                return false;
            }
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
                total += (t.paciente && t.paciente.id) ? 1 : 0;
            });
        }

        return total;
    }

    tienePermisos(tipoPrestacion, prestacion) {
        let permisos = this.auth.getPermissions('rup:tipoPrestacion:?');
        let existe = permisos.find(permiso => (permiso === tipoPrestacion._id));

        // vamos a comprobar si el turno tiene una prestacion asociada y si ya esta en ejecucion
        // por otro profesional. En ese caso no debería poder entrar a ejecutar o validar la prestacion
        if (prestacion) {
            if (prestacion.estados[prestacion.estados.length - 1].createdBy.username !== this.auth.usuario.username) {
                return null;
            }
        }
        return existe;
    }

    cargarTurnos(agenda) {
        this.agendaSeleccionada = agenda ? agenda : 'fueraAgenda';
    }


    routeTo(action, id) {
        if (this.agendaSeleccionada && this.agendaSeleccionada !== 'fueraAgenda') {
            let agenda = this.agendaSeleccionada ? this.agendaSeleccionada : null;
            localStorage.setItem('idAgenda', agenda.id);
        }
        this.router.navigate(['rup/' + action + '/', id]);
    }


    // dada una prestación busca las prestaciones generadas (por planes) que esten pendientes y sin turno asignado.
    comprobarPrestacionesPendientes(unaPrestacion) {
        if (unaPrestacion.id && unaPrestacion.estados[unaPrestacion.estados.length - 1].tipo === 'validada') {
            let registropendiente = unaPrestacion.ejecucion.registros.filter(registro => registro.esSolicitud && registro.valor && registro.valor.autocitado);
            if (registropendiente && registropendiente.length > 0) {
                this.servicioPrestacion.get({ idPrestacionOrigen: unaPrestacion.id }).subscribe(prestacionesPaciente => {
                    prestacionesPaciente.forEach(elemento => {
                        if (elemento.estados[elemento.estados.length - 1].tipo === 'pendiente'
                            && !elemento.solicitud.turno) {
                            unaPrestacion.turnosPedientes = true;
                        }
                    });
                });
            }
        }
    }


    // Recibe un array o un objeto lo recorre y busca los planes que estan pendientes..
    mostrarTurnoPendiente(prestaciones) {
        if (prestaciones) {
            if (Array.isArray(prestaciones)) {
                let _prestaciones = prestaciones.filter(p => {
                    // filtramos todas las prestaciones que:
                    // 1) esten validadas
                    // 2) que sean planes y sean autocitados
                    let registropendiente = p.ejecucion.registros.filter(registro => registro.esSolicitud && registro.valor &&
                        registro.valor.autocitado
                    );
                    if (p.id && p.estados[p.estados.length - 1].tipo === 'validada' && registropendiente.length > 0
                    ) {
                        return p;
                    };
                });
                _prestaciones.forEach(unaPrestacion => {
                    this.comprobarPrestacionesPendientes(unaPrestacion);
                });
            } else { // ingresa cuando lo llamo con una prestacion
                this.comprobarPrestacionesPendientes(prestaciones);
            }
        }
        return prestaciones;
    }

    // Detecta si una Agenda es futura
    esFutura(agenda: IAgenda = null) {
        let fechaAgenda = moment(agenda.horaInicio).startOf('day');
        let fechaActual = moment(new Date()).endOf('day');
        return fechaAgenda.isAfter(fechaActual);
    }

    // Detecta si "hoy" es el día de la Agenda
    diaAgenda(agenda: IAgenda) {
        return moment(agenda.horaInicio).fromNow();
    }

}


