import { Plex } from '@andes/plex';
import { FILE_EXT, IMAGENES_EXT } from '@andes/shared';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DriveService } from 'src/app/services/drive.service';
import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { AdjuntosService } from './../../rup/services/adjuntos.service';

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
    fileToken: string = null;
    timeout = null;
    adjuntosEstado;
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;
    public nuevoEstado;
    public documentosUrl = [];
    public dispositivo = null;
    public oxigeno = 'oxigeno';
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'intermedia', label: 'Intermedia' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    @Input() esCOM = false;
    @Input('derivacion')
    set _derivacion(value) {
        this.nuevoEstado = {
            observacion: '',
            prioridad: value.prioridad
        };
        this.dispositivo = value.dispositivo;
        this.adjuntosEstado = [];
        this.derivacion = value;
    }

    @Output() returnEditarEstado: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public adjuntosService: AdjuntosService,
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

            if (this.derivacion.prioridad === this.nuevoEstado.prioridad) {
                delete this.nuevoEstado.prioridad;
            }

            this.nuevoEstado.dispositivo = this.derivacion.dispositivo;

            const body = { estado: this.nuevoEstado };

            this.derivacionService.updateHistorial(this.derivacion._id, body).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnEditarEstado.emit(true);
            });
        }
    }

    onUpload($event) {
        if ($event.status === 200) {
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
                url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
            };
        });
    }

    cerrar() {
        this.returnEditarEstado.emit(false);
    }
}
