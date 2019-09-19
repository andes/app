import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { CamasService } from '../services/camas.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { InternacionService } from '../services/internacion.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';


@Component({
    selector: 'cama-desocupar',
    templateUrl: 'cama-desocupar.html'
})
export class DesocuparCamaComponent implements OnInit {

    // Propiedades privadas

    // Propiedades públicas
    public organizacion: any;
    public opcionDesocupar = null;
    public elegirDesocupar = true;
    public fecha = new Date();
    public hora = new Date();
    public opcionesDesocupar = [
        { id: 'movimiento', label: 'Cambiar de cama' },
        { id: 'egreso', label: 'Egresar al paciente' }];

    public listaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public PaseAunidadOrganizativa: any;
    public camaSeleccionPase;
    public actualizaTipo = new Subject();
    public listaPasesCama = [];

    // Eventos
    // cama sobre la que estamos trabajando
    @Input() cama: any;
    @Input() workflowC;
    // Internacion (prestacion) que está ocupando la cama
    @Input() prestacion: any;

    // resultado de la accion realizada sobre la cama
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();
    // @Output() verInternacionEmit: EventEmitter<any> = new EventEmitter<any>();


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
        if (this.prestacion && this.cama) {
            this.opcionDesocupar = null;
            this.elegirDesocupar = true;
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                this.organizacion = organizacion;
                this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== this.cama.ultimoEstado.unidadOrganizativa.conceptId) : [];
                if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 0) {
                    this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad organizativa' });
                }
                this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
                    this.listaPasesCama = lista;
                });
            });
        } else {
            this.plex.info('danger', 'Parámetros incorrectos', 'Error');
            this.cancelar();
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

                const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
                if (this.opcionDesocupar === 'movimiento' || this.opcionDesocupar === 'pase') {
                    let nuevoEstado = this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible';
                    // Primero desocupamos la cama donde esta el paciente actualmente
                    const filtroEstado = this.cama.estados.filter(c => c.fecha < fechaMovimiento && c.idInternacion === this.prestacion.id);
                    const ultimoEstado = filtroEstado[filtroEstado.length - 1];
                    const paciente = ultimoEstado.paciente;
                    const idInternacion = ultimoEstado.idInternacion;
                    this.camasService.cambioEstadoMovimiento(this.cama.id, ultimoEstado, nuevoEstado, fechaMovimiento, null, null, this.PaseAunidadOrganizativa).subscribe(camaActualizada => {
                        this.cama = camaActualizada;
                        if (this.camaSeleccionPase) {
                            // Si hay que hacer un movimiento o pase de cama cambiamos el estado de la cama seleccionada a ocupada
                            const filtroEstadoPase = this.camaSeleccionPase.estados.filter(c => c.fecha < fechaMovimiento);
                            const ultimoEstadoPase = filtroEstadoPase[filtroEstado.length - 1];
                            this.camasService.cambioEstadoMovimiento(this.camaSeleccionPase.id, ultimoEstadoPase, 'ocupada', fechaMovimiento, paciente, idInternacion,
                                this.PaseAunidadOrganizativa).subscribe(camaCambio => {
                                    this.camaSeleccionPase.ultimoEstado = camaCambio.ultimoEstado;
                                    this.opcionDesocupar = null;
                                    this.elegirDesocupar = true;
                                    // emitimos las camas modificadas
                                    this.accionCama.emit({ cama: this.cama, accion: 'movimientoCama', camaOcupada: this.camaSeleccionPase });

                                }, (err1) => {
                                    this.plex.info('danger', err1, 'Error');
                                });
                        } else {

                            this.plex.info('warning', 'Paciente ingresado a lista de espera');
                            this.accionCama.emit({ cama: this.cama, accion: 'movimientoCama' });

                        }


                    }, (err) => {
                        this.plex.info('danger', err, 'Error');
                    });

                }
                // else {
                //     this.opcionDesocupar = null;
                //     this.elegirDesocupar = true;
                // }
            }
        }
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

    operacionDesocuparCama() {
        if (this.opcionDesocupar === 'movimiento') {
            this.elegirDesocupar = false;
            this.listadoCamas = null;
            this.elegirDesocupar = false;
            const camaOcupada = this.buscarCamaOcupada();
            if (camaOcupada) {
                let unidadOrganizativa = camaOcupada.estados.unidadOrganizativa;
                this.selectCamasDisponibles(unidadOrganizativa.conceptId, this.fecha, this.hora);
            } else {
                this.elegirDesocupar = true;
            }

        } else {
            if (this.opcionDesocupar === 'pase') {
                this.elegirDesocupar = false;
                this.listadoCamas = null;
            } else {
                if (this.opcionDesocupar === 'egreso') {
                    this.accionCama.emit({ cama: this.cama, accion: 'egresarPaciente' });
                }
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
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

}
