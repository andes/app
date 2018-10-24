import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { PacienteService } from '../../../../../../services/paciente.service';
import { CamasService } from '../../../../services/camas.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { PrestacionesService } from '../../../../services/prestaciones.service';
import { InternacionService } from '../../../../services/internacion.service';

@Component({
    selector: 'cama',
    templateUrl: './cama.component.html',
    styleUrls: ['./cama.component.scss'],
})
export class CamaComponent implements OnInit {
    @Input() cama: any;
    @Input() prestacion: any;
    // Lo usamos para pasar el id de la organizacion y la fecha del mapa de camas que tenemos en la vista.
    @Input() params: any;
    @Input() readOnly: boolean;
    @Input() showEstados: boolean;
    @Output() evtCama: EventEmitter<any> = new EventEmitter<any>();
    @Output() buscarPaciente: EventEmitter<any> = new EventEmitter<any>();
    @Output() camaSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() verInternacionEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() data: EventEmitter<any> = new EventEmitter<any>();

    public organizacion: any;
    public paseAunidadOrganizativa: any;
    // opciones dropdown cama internada
    public opcionesDropdown: any = [];
    public estadoDesbloqueo: String = 'disponible';
    public fecha = new Date();
    public hora = new Date();
    public disabledButton = false;
    public camaSeleccionPase;
    // lista de los motivos del bloque, luego los va a traer desde snomed
    public listaMotivosBloqueo = [{ id: 'Bolqueo', name: 'Bloqueo' }, { id: 'Se envia a reparar', name: 'Se envia a reparar' }];
    public opcionesDesbloqueo = [
        { id: 'desocupada', label: 'Para desinfectar' },
        { id: 'disponible', label: 'Disponible' }
    ];
    public opcionDesocupar = null;
    public listadoCamas = [];
    public listaUnidadesOrganizativas = [];

    // Al desocupar la cama mostrar los radio para que seleccionen la subOperacion al desocupar
    // 1) Movimiento de cama
    // 2) Pase a otra UO
    // 3) Egreso del paciente
    public elegirDesocupar = true;
    public opcionesDesocupar = [
        { id: 'movimiento', label: 'Cambiar de cama' },
        { id: 'egreso', label: 'Egresar al paciente' }];

    public listaCamasDisponibles;

    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        private router: Router,
        public organizacionService: OrganizacionService,
        private pacienteService: PacienteService,
        private prestacionesService: PrestacionesService,
        private internaiconService: InternacionService) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== this.cama.ultimoEstado.unidadOrganizativa.conceptId) : [];
            if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 0) {
                this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad' });
            }
        });

        this.opcionesDropdown = [
            {
                label: 'Valoración inicial enfermería',
                handler: (() => {
                    // this.verValoracionInicial(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Valoración inicial médica',
                handler: (() => {
                    // this.verValoracionMedica(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Desocupar cama',
                handler: (() => {
                    // this.egresarPaciente(scope.cama);
                    alert('TODO');
                })
            }
        ];
    }


    /**
     * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
     */

    public getHabitacionName() {
        let sec = this.cama.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }


    /**
     * Buscar un paciente para internar.
     *
     * @param {any} cama Cama en la cual se va a internar el paciente.
     * @memberof CamaComponent
     */
    public iniciarPrestacion(cama: any) {
        if (cama.ultimoEstado.estado !== 'disponible') {
            this.plex.info('warning', 'Debe desinfectar la cama antes de poder internar un paciente', 'Error');
        } else {
            if (this.prestacion) {
                this.darCama();
            } else {
                this.buscarPaciente.emit(true);
                this.camaSelected.emit(cama);
            }
        }
    }

    /**
     * Editar una cama
     *
     * @param {any} cama Cama que se envia a editar
     * @memberof CamaComponent
     */
    editarCama(cama: any) {
        this.router.navigate(['tm/organizacion/cama', cama.id]);
    }

    /**
     * Visualizar internacion
     *
     * @param {any} cama Cama en la cual se encuentra internado el paciente.
     * @memberof CamaComponent
     */
    public verPrestacion(cama: any) {
        if (cama.ultimoEstado.estado === 'ocupada' && cama.ultimoEstado.idInternacion) {
            this.verInternacionEmit.emit(cama);
            // this.router.navigate(['rup/internacion/ver', cama.ultimoEstado.idInternacion]);
        }
    }

    public devolverCama(cama) {
        let dto = {
            fecha: this.combinarFechas(),
            estado: cama.ultimoEstado.estado,
            unidadOrganizativa: cama.unidadOrganizativaOriginal,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: cama.ultimoEstado.paciente ? cama.ultimoEstado.paciente : null,
            idInternacion: cama.ultimoEstado.idInternacion ? cama.ultimoEstado.idInternacion : null
        };
        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
            this.evtCama.emit(null);
        });
    }

    public cambiarEstado(cama, estado) {
        let dto = {
            fecha: this.combinarFechas(),
            estado: estado,
            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: cama.ultimoEstado.paciente ? cama.ultimoEstado.paciente : null,
            idInternacion: cama.ultimoEstado.idInternacion ? cama.ultimoEstado.idInternacion : null,
            esMovimiento: false
        };
        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
            cama.ultimoEstado = camaActualizada.ultimoEstado;
            let msg = '';
            switch (estado) {
                case 'reparacion':
                    msg = ' enviada a reparación';
                    break;
                case 'disponible':
                    msg = ' disponible';
                    break;
                case 'bloqueada':
                    msg = ' bloqueada';
                    break;
                case 'desocupada':
                    if (cama.$action === 'reparacion') {
                        msg = ' reparada';
                    } else if (cama.$action === 'bloquear') {
                        msg = ' desbloqueada';
                    } else {
                        msg = 'En preparacion';
                    }
                    break;
            }
            this.plex.toast('success', 'Cama ' + msg, 'Cambio estado');
            // rotamos card
            setTimeout(() => {
                // rotamos cama
                cama.$rotar = false;
                // limpiar motivo por el cual se cambio el estado
                cama.$motivo = '';
                // emitimos la cama modificada
                this.evtCama.emit({ cama: cama });
            }, 100);
        }, (err) => {
            this.plex.info('danger', err, 'Error');
        });
    }

    public desocuparCama(event, cama, estado) {
        if (event.formValid) {
            let paciente = cama.ultimoEstado.paciente;
            let idInternacion = cama.ultimoEstado.idInternacion;
            if (this.opcionDesocupar === 'movimiento' || this.opcionDesocupar === 'pase') {
                let nuevoEstado = this.internaiconService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible';
                // Primero desocupamos la cama donde esta el paciente actualmente
                this.camasService.cambioEstadoMovimiento(cama, nuevoEstado, this.combinarFechas(), null, null, this.paseAunidadOrganizativa).subscribe(camaActualizada => {
                    cama.ultimoEstado = camaActualizada.ultimoEstado;
                    // Si hay que hacer un movimiento o pase de cama cambiamos el estado de la cama seleccionada a ocupada
                    this.camasService.cambioEstadoMovimiento(this.camaSeleccionPase, 'ocupada', this.combinarFechas(), paciente, idInternacion,
                        this.paseAunidadOrganizativa).subscribe(camaCambio => {
                            this.camaSeleccionPase.ultimoEstado = camaCambio.ultimoEstado;
                            this.rotarDesocuparCama();
                            // emitimos las camas modificadas
                            this.evtCama.emit({ camaDesocupada: cama, movimientoCama: true, camaOcupada: this.camaSeleccionPase });

                        }, (err1) => {
                            this.plex.info('danger', err1, 'Error');
                        });

                }, (err) => {
                    this.plex.info('danger', err, 'Error');
                });
            } else {
                if (this.opcionDesocupar === 'egreso') {
                    this.verInternacionEmit.emit(cama);
                }
            }
        }
    }

    setFecha() {
        this.fecha = new Date();
    }

    /**
     * Función que sirve para asignarle una cama a un paciente: DESDE LA LISTA DE ESPERA
     *
     * @param paciente paciente que será asignado a una cama
     * @param idInternacion internación que está siendo ejecutada
     * @param cama cama que será asignada a un paciente
     */
    darCama(paciente = null, idInternacion = null, cama = null) {
        let dto: any;
        let idPaciente = paciente ? paciente._id : this.prestacion.paciente.id;
        idInternacion = idInternacion ? idInternacion : this.prestacion.id;
        cama = cama ? cama : this.cama;
        this.pacienteService.getById(idPaciente).subscribe(pacienteCompleto => {
            dto = {
                fecha: new Date,
                estado: 'ocupada',
                unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
                especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
                esCensable: cama.ultimoEstado.esCensable,
                genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
                paciente: pacienteCompleto,
                idInternacion: idInternacion
            };
            this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
                // Aca deberiamos mostrar el resumen en el sidebar
                this.plex.toast('success', 'Se completo el pase de cama', 'Cambio estado');
                this.evtCama.emit({ cama: camaActualizada });
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
            });
        });
    }

    /**
     * Carga el combo de las camas disponibles por unidad organizativa
     */
    selectCamasDisponibles(idUnidadOrganizativa) {
        let fecha = moment().endOf('day').toDate();
        this.camasService.getCamasXFecha(this.auth.organizacion.id, fecha).subscribe(resultado => {
            if (resultado) {
                let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.id === idUnidadOrganizativa);
                this.listadoCamas = [...lista];
            }

        });
    }

    /**
     * Elegir al desocupar la cama que operacion se desea realizar:
     * Movimiento dentro de la misma UO / Pase de UO / Egreso Paciente
     * @param opcionElegida
     */
    operacionDesocuparCama() {
        if (this.opcionDesocupar === 'movimiento') {
            this.elegirDesocupar = false;
            this.selectCamasDisponibles(this.cama.ultimoEstado.unidadOrganizativa.id);
        } else {
            if (this.opcionDesocupar === 'pase') {
                this.elegirDesocupar = false;

            } else {
                if (this.opcionDesocupar === 'egreso') {
                    this.rotarDesocuparCama();
                    this.verInternacionEmit.emit(this.cama);
                }
            }
        }
    }

    seleccionarCama() {
        this.camaSelected.emit(this.cama);
    }

    combinarFechas() {
        if (this.fecha && this.hora) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;
            auxiliar = new Date(this.fecha);
            horas = this.hora.getHours();
            minutes = this.hora.getMinutes();
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    rotarDesocuparCama() {
        this.cama.$rotar = !this.cama.$rotar;
        this.elegirDesocupar = true;
        this.opcionDesocupar = null;
        this.listadoCamas = [];
    }

    comprobarWorkflow() {
        return this.internaiconService.usaWorkflowCompleto(this.auth.organizacion._id);
    }


}
