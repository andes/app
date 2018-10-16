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
    @Input() cama: any;
    @Output() evtCama: EventEmitter<any> = new EventEmitter<any>();
    @Output() verInternacionEmit: EventEmitter<any> = new EventEmitter<any>();

    // Constructor
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        public organizacionService: OrganizacionService,
        private internaiconService: InternacionService) {

    }

    // Métodos (privados y públicos)

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== this.cama.ultimoEstado.unidadOrganizativa.conceptId) : [];
            if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 0) {
                this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad' });
            }
        });

    }

    /**
     * Guardar los datos del formulario y emitir el dato guardado
     *
     * @param {any} $event formulario a validar
     * @memberof TemplateFormComponent
     */

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
    selectCamasDisponibles(idUnidadOrganizativa) {
        let fecha = moment().endOf('day').toDate();
        this.camasService.getCamasXFecha(this.auth.organizacion.id, fecha).subscribe(resultado => {
            if (resultado) {
                let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.id === idUnidadOrganizativa);
                this.listadoCamas = [...lista];
            }

        });
    }
    rotarDesocuparCama() {
        this.cama.$rotar = !this.cama.$rotar;
        this.elegirDesocupar = true;
        this.opcionDesocupar = null;
        this.listadoCamas = [];
    }

}