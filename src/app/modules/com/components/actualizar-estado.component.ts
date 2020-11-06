import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Plex } from '@andes/plex';
import { Input, Component, OnInit, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';

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
        public plex: Plex
    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/com/store/' + doc.id + '?token=' + this.fileToken;
        }
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

    // Adjuntar archivo
    changeListener($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        let ext = this.fileExtension(inputValue.value);
        this.errorExt = false;
        if (!this.extensions.find((item) => item === ext.toLowerCase())) {
            (this.childsComponents.first as any).nativeElement.value = '';
            this.errorExt = true;
            return;
        }
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            (this.childsComponents.first as any).nativeElement.value = '';
            let metadata = {};
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.adjuntosEstado.push({
                    ext,
                    id: data._id
                });
            });
        };
        myReader.readAsDataURL(file);
    }

    fileExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    removeFile($event) {
        let index = this.adjuntosEstado.indexOf($event);
        this.adjuntosEstado.splice(index, 1);
    }

    get documentosUrl() {
        return this.adjuntosEstado.map((doc) => {
            doc.url = this.createUrl(doc);
            return doc;
        });
    }

    cancelarAdjunto() {
        clearTimeout(this.timeout);
        this.waiting = false;
    }

    cerrar() {
        this.returnEditarEstado.emit(false);
    }
}
