import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../mapa-camas.service';


@Component({
    selector: 'app-desocupar-cama',
    templateUrl: 'desocupar-cama.component.html'
})
export class CamaDesocuparComponent implements OnInit {
    // Eventos
    @Input() fecha: Date;
    @Input() camas: any;
    @Input() cama: any;
    @Input() prestacion;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionDesocupar: EventEmitter<any> = new EventEmitter<any>();

    // Propiedades públicas
    public fechaIngreso;
    public fechaEgreso;
    public fechaValida;
    public mensajeError;
    public camasMismaUO = [];
    public camasDistintaUO = [];
    public opcionesDesocupar = [
        { id: 'movimiento', label: 'Cambiar de cama' },
        { id: 'egreso', label: 'Egresar al paciente' }];

    // Constructor
    constructor(
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        if (this.prestacion) {
            this.fechaIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
            if (this.prestacion.ejecucion.registros[1]) {
                this.fechaEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso;
                this.fecha = this.fechaEgreso;
            } else {
                this.fecha = moment().toDate();
            }
            this.verificarFecha(this.fecha);
        } else if (this.camas) {
            this.obtenerCamasDisponibles();
        }
    }

    getSnapshot() {
        this.mapaCamasService.snapshot(this.fecha).subscribe(snapshot => {
            this.camas = snapshot;
            snapshot.map(snap => {
                if (snap.idInternacion === this.prestacion._id) {
                    this.cama = snap;
                    this.obtenerCamasDisponibles();
                }
            });
        });
    }

    obtenerCamasDisponibles() {
        this.camasMismaUO = [];
        this.camasDistintaUO = [];
        this.camas.map(cama => {
            if (!cama.paciente) {
                if (cama.idCama !== this.cama.idCama) {
                    if (cama.unidadOrganizativa.conceptId === this.cama.unidadOrganizativa.conceptId) {
                        this.camasMismaUO.push(cama);
                    } else {
                        this.camasDistintaUO.push(cama);
                    }
                }
            }
        });
    }

    verificarFecha(fecha) {
        this.fechaValida = false;
        if (fecha > this.fechaIngreso) {
            if (this.fechaEgreso) {
                if (fecha < this.fechaEgreso) {
                    this.fechaValida = true;
                    this.getSnapshot();
                } else {
                    this.mensajeError = `La fecha y hora no puede ser mayor o igual a la de egreso (${moment(this.fechaEgreso).format('DD/MM/YYYY HH:mm')})`;
                }
            } else if (fecha <= moment().toDate()) {
                this.fechaValida = true;
                this.getSnapshot();
            } else {
                this.mensajeError = `La fecha y hora no puede ser mayor a la de hoy (${moment().format('DD/MM/YYYY HH:mm')})`;
            }
        } else {
            this.mensajeError = `La fecha y hora no puede ser menor a la de ingreso (${moment(this.fechaIngreso).format('DD/MM/YYYY HH:mm')})`;
        }
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarCama(cambiarUO: boolean) {
        if (cambiarUO) {
            this.accionDesocupar.emit({ camasDisponibles: this.camasDistintaUO, cama: this.cama, cambiarUO });
        } else {
            this.accionDesocupar.emit({ camasDisponibles: this.camasMismaUO, cama: this.cama, cambiarUO });
        }
    }

    egresarPaciente() {
        this.accionDesocupar.emit({ cama: this.cama, accion: 'egresarPaciente' });
    }
}
