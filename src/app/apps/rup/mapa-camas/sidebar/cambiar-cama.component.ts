import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../mapa-camas.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-cambiar-cama',
    templateUrl: './cambiar-cama.component.html',
})

export class CambiarCamaComponent implements OnInit {

    // EVENTOS
    @Input() camas: any;
    @Input() cama: any;

    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public ambito;
    public capa;
    public camasOpciones: any;
    public nuevaCama: any;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private mapaCamasService: MapaCamasService
    ) {
        this.ambito = mapaCamasService.ambito;
        this.capa = mapaCamasService.capa;
    }

    ngOnInit() {
        this.camasOpciones = [];
        this.camas.map(cama => {
            if (cama.unidadOrganizativa.conceptId === this.cama.unidadOrganizativa.conceptId) {
                if (cama.estado === 'disponible') {
                    this.camasOpciones.push({ id: cama.idCama, nombre: cama.nombre });
                }
            }
        });
    }

    guardar(valid) {
        if (valid.formValid) {
            let camaElegida = this.camas.find(cama => cama.idCama === this.nuevaCama.id);
            camaElegida.estado = this.cama.estado;
            camaElegida.idInternacion = this.cama.idInternacion;
            camaElegida.paciente = this.cama.paciente;

            this.cama.estado = 'disponible';
            this.cama.idInternacion = null;
            this.cama.paciente = null;

            let fecha = moment().toDate();
            this.mapaCamasService.patchCama(camaElegida, fecha).subscribe(camaActualizada => {
                this.refresh.emit({ cama: camaElegida, accion: 'internarPaciente' });
                this.mapaCamasService.patchCama(this.cama, fecha).subscribe(cama => {
                    this.refresh.emit({ cama: this.cama, accion: 'internarPaciente' });
                    this.plex.info('success', 'Cambio de cama exitoso!');
                });
            });
        }
    }
}
