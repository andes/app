import { Input, Component, SimpleChanges, OnChanges } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';

@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalleSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class DetalleSolicitudComponent implements OnChanges {


    @Input() prestacionSeleccionada: any;

    @Input() turnoSeleccionado: any;

    @Input() tipoSolicitud: string;


    public items = [
        { key: 'solicitud', label: 'SOLICITUD' },
        { key: 'historial', label: 'HISTORIAL' }
    ];
    public mostrar;


    constructor(
        public adjuntosService: AdjuntosService
    ) { }

    fotos: any[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes.prestacionSeleccionada) {
            this.adjuntosService.token$.subscribe((payload) => {
                const { token } = payload;
                const solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
                const documentos = solicitudRegistros[0].valor.documentos || [];
                this.fotos = documentos.map((doc) => {
                    return {
                        ...doc,
                        url: this.adjuntosService.createUrl('rup', doc, token)
                    };
                });
            });
        }
    }

    cambiarOpcion(opcion) {
        this.mostrar = opcion;
    }

}
