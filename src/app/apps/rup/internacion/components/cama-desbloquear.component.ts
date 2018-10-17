import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { CamasService } from '../services/camas.service';
import { InternacionService } from '../services/internacion.service';

@Component({
    selector: 'cama-desbloquear',
    templateUrl: 'cama-desbloquear.html'
})
export class CamaDesbloquearComponent implements OnInit {

    // Propiedades privadas

    // Propiedades públicas

    public opcionesDesbloqueo = [
        { id: 'desocupada', label: 'Para desinfectar' },
        { id: 'disponible', label: 'Disponible' }
    ];
    public fecha = new Date();
    public hora = new Date();

    public estadoDesbloqueo: String = 'disponible';


    // Eventos
    @Input() cama: any;
    // resultado de la accion realizada sobre la cama
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();
    // Constructor
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        private internacionService: InternacionService) {

    }

    ngOnInit() {
    }

    cancelar() {
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }
    comprobarWorkflow() {
        return this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id);
    }


    public desbloquearCama(event) {
        if (event.formValid) {
            this.camasService.nuevoEstadoCama(this.cama, this.estadoDesbloqueo, this.internacionService.combinarFechas(this.fecha, this.hora)).subscribe(camaActualizada => {
                this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                this.accionCama.emit({ cama: this.cama, accion: 'desbloqueoCama' });
            }, (err) => {
                this.plex.info('danger', err, 'Error');
            });
        }


    }
}
