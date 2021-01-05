import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Plex } from '@andes/plex';
import { Input, Component, OnInit, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';
import { DriveService } from 'src/app/services/drive.service';

@Component({
    selector: 'actualizar-estado',
    templateUrl: './actualizar-estado.html',
    styleUrls: ['./adjuntos.scss', './punto-inicio.scss']
})
export class ActualizarEstadoDerivacionComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    public derivacion;
    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    fileToken: String = null;
    timeout = null;
    adjuntosEstado;
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;
    public nuevoEstado;
    public documentosUrl = [];
    public prioridad = '';
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    @Input() esCOM = false;
    @Input('derivacion')
    set _derivacion(value) {
        this.nuevoEstado = {
            observacion: ''
        };
        this.prioridad = value.prioridad;
        this.adjuntosEstado = [];
        this.derivacion = value;
    }

    @Output() returnEditarEstado: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public adjuntosService: COMAdjuntosService,
        public sanitazer: DomSanitizer,
        private derivacionService: DerivacionesService,
        public plex: Plex,
        private driveService: DriveService
    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    actualizarEstado($event) {
        if ($event.formValid) {
            this.nuevoEstado.adjuntos = this.adjuntosEstado;
            if (this.derivacion.prioridad !== this.prioridad) {
                this.nuevoEstado.prioridad = this.prioridad;
            }
            this.derivacionService.updateHistorial(this.derivacion._id, this.nuevoEstado).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnEditarEstado.emit(true);
            });
        }
    }

    setPrioridad(prioridad) {
        this.prioridad = prioridad;
    }

    onUpload($event) {
        if ($event.status = 200) {
            this.adjuntosEstado.push({
                ext: $event.body.ext,
                id: $event.body.id
            });
            this.calcDocumentosUrl();
        }
    }

    removeFile($event) {
        this.driveService.deleteFile($event.id).subscribe(() => {
            const index = this.adjuntosEstado.findIndex(a => a.id === $event.id);
            this.adjuntosEstado.splice(index, 1);
            this.calcDocumentosUrl();
        });
    }

    calcDocumentosUrl() {
        this.documentosUrl = this.adjuntosEstado.map((doc) => {
            return {
                ...doc,
                url: this.derivacionService.getUrlImage(doc.id, this.fileToken)
            };
        });
    }

    cerrar() {
        this.returnEditarEstado.emit(false);
    }
}
