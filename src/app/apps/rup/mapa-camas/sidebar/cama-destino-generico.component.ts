import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../services/mapa-camas.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-cama-destino-generico',
    templateUrl: 'cama-destino-generico.component.html',
})

export class CamaDestinoGenericoComponent implements OnInit {
    @Input() fecha: Date;
    @Input() selectedCama: any;
    @Input() camas: any;
    @Input() destino: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    public ambito: string;
    public capa: string;
    public titulo: string;
    public fechaValida = true;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private mapaCamasService: MapaCamasService
    ) {

    }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;
        this.capa = this.mapaCamasService.capa;
        this.titulo = 'CAMBIAR A ' + this.destino.toUpperCase();
    }

    cancelar() {
        this.cancel.emit();
    }


    guardar() {
        if (this.fechaValida) {
            if (this.selectedCama) {
                // Se modifica el estado de la cama
                this.selectedCama.estado = this.destino;

                this.mapaCamasService.save(this.selectedCama, this.fecha).subscribe(camaActualizada => {
                    this.plex.info('success', 'Cama ' + this.destino);
                    this.refresh.emit({ cama: this.selectedCama });
                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                });
            }
        }
    }

    cambiarFechaIngreso(fecha) {
        let fechaUltimoEstado = moment(this.selectedCama.fecha, 'DD-MM-YYYY HH:mm');
        if (fecha <= moment().toDate() && fecha < fechaUltimoEstado) {
            this.fechaValida = true;
            this.cambiarFecha.emit(fecha);
        } else {
            this.fechaValida = false;
        }
    }

    cambiarSeleccionCama() {
        this.cambiarCama.emit(this.selectedCama);
    }
}
