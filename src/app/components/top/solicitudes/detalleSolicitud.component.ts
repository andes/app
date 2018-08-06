import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalleSolicitud.html',
})
export class DetalleSolicitudComponent {

    @Input() solicitudSeleccionada: any;
    @Input() turnoSeleccionado: any;
    @Input() tipoSolicitud: string;

    @Output() afterDetalleSolicitud: EventEmitter<any> = new EventEmitter<any>();

    constructor(plex: Plex) { }
}
