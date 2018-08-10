import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalleSolicitud.html',
})
export class DetalleSolicitudComponent {

    @Input() prestacionSeleccionada: any;
    @Input() turnoSeleccionado: any;
    @Input() tipoSolicitud: string;

    constructor(plex: Plex) { }
}
