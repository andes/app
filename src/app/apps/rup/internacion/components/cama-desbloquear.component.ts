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
            let dto = {
                fecha: this.internacionService.combinarFechas(this.fecha, this.hora),
                estado: 'disponible',
                unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                esCensable: this.cama.ultimoEstado.esCensable,
                genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                paciente: this.cama.ultimoEstado.paciente ? this.cama.ultimoEstado.paciente : null,
                idInternacion: this.cama.ultimoEstado.idInternacion ? this.cama.ultimoEstado.idInternacion : null,
                esMovimiento: false
            };
            this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                this.accionCama.emit({ cama: this.cama, accion: 'desbloqueoCama' });
            }, (err) => {
                this.plex.info('danger', err, 'Error');
            });
        }

    }
}
