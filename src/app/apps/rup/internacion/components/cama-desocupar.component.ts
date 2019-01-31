import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CamasService } from '../services/camas.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { InternacionService } from '../services/internacion.service';


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
    public paseAunidadOrganizativa: any;
    public camaSeleccionPase;

    // Eventos
    // cama sobre la que estamos trabajando
    @Input() cama: any;

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
        private internacionService: InternacionService) {

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
                    this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad' });
                }
            });
        } else {
            this.plex.info('danger', 'Parámetros incorrectos', 'Error');
            this.cancelar();
        }

    }

    filtrosDesocupar() {
        const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
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
                let paciente = this.cama.ultimoEstado.paciente;
                let idInternacion = this.cama.ultimoEstado.idInternacion;
                if (this.opcionDesocupar === 'movimiento' || this.opcionDesocupar === 'pase') {
                    let nuevoEstado = this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible';
                    // Primero desocupamos la cama donde esta el paciente actualmente
                    this.camasService.cambioEstadoMovimiento(this.cama, nuevoEstado, this.internacionService.combinarFechas(this.fecha, this.hora), null, null, this.paseAunidadOrganizativa).subscribe(camaActualizada => {
                        this.cama = camaActualizada;
                        // Si hay que hacer un movimiento o pase de cama cambiamos el estado de la cama seleccionada a ocupada
                        this.camasService.cambioEstadoMovimiento(this.camaSeleccionPase, 'ocupada', this.internacionService.combinarFechas(this.fecha, this.hora), paciente, idInternacion,
                            this.paseAunidadOrganizativa).subscribe(camaCambio => {
                                this.camaSeleccionPase.ultimoEstado = camaCambio.ultimoEstado;
                                this.opcionDesocupar = null;
                                this.elegirDesocupar = true;
                                // emitimos las camas modificadas
                                this.accionCama.emit({ cama: this.cama, accion: 'movimientoCama', camaOcupada: this.camaSeleccionPase });

                            }, (err1) => {
                                this.plex.info('danger', err1, 'Error');
                            });

                    }, (err) => {
                        this.plex.info('danger', err, 'Error');
                    });
                }
            }
            // else {
            //     this.opcionDesocupar = null;
            //     this.elegirDesocupar = true;
            // }
        }
    }

    operacionDesocuparCama() {
        if (this.opcionDesocupar === 'movimiento') {
            this.elegirDesocupar = false;
            this.selectCamasDisponibles(this.cama.ultimoEstado.unidadOrganizativa.conceptId);
        } else {
            if (this.opcionDesocupar === 'pase') {
                this.elegirDesocupar = false;
            } else {
                if (this.opcionDesocupar === 'egreso') {
                    this.accionCama.emit({ cama: this.cama, accion: 'egresarPaciente' });
                }
            }
        }
    }

    selectCamasDisponibles(unidadOrganizativa) {
        if (this.fecha && this.hora) {
            const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
            if (this.filtrosDesocupar()) {
                this.camasService.getCamasXFecha(this.auth.organizacion.id, fechaMovimiento).subscribe(resultado => {
                    if (resultado) {
                        let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === unidadOrganizativa);
                        this.listadoCamas = [...lista];
                    }

                });
            } else {
                this.cancelar();
            }

        } else {
            this.cancelar();
            this.plex.info('danger', 'Debe seleccionar fecha y hora del movimiento');
        }
    }

    cancelar() {
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

}
