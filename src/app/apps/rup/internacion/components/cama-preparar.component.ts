import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICama } from '../interfaces/ICama';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { CamasService } from '../services/camas.service';

@Component({
    selector: 'cama-preparar',
    templateUrl: 'cama-preparar.html'
})
export class CamaPrepararComponent implements OnInit {

    public fecha = new Date();
    public hora = new Date();

    // cama sobre la que estamos trabajando
    @Input() cama: ICama;

    // resultado de la accion realizada sobre la cama
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private internacionService: InternacionService, private camasService: CamasService) { }

    ngOnInit() { }

    public prepararCama(event) {
        if (event.formValid) {
            this.camasService.nuevoEstadoCama(this.cama, 'disponible', this.internacionService.combinarFechas(this.fecha, this.hora)).subscribe(camaActualizada => {
                this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                this.accionCama.emit({ cama: this.cama, accion: 'PrepararCama' });
            }, (err) => {
                this.plex.info('danger', err, 'Error');
            });
        }
    }


    cancelar() {
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

}
