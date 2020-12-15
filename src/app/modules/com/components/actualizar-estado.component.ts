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
    styleUrls: ['./adjuntos.scss']
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
    @Input('derivacion')
    set _derivacion(value) {
        this.nuevoEstado = {
            observacion: ''
        };
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
            this.derivacion.historial.push(this.nuevoEstado);
            this.derivacionService.update(this.derivacion._id, this.derivacion).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnEditarEstado.emit(true);
            });
        }
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
