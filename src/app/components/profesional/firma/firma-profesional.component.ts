import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from '../../../interfaces/IProfesional';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../../services/profesional.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { IMAGENES_EXT } from '@andes/shared';

@Component({
    selector: 'app-firma-profesional',
    templateUrl: 'firma-profesional.html',
    styleUrls: ['firma-profesional.scss']
})
export class FirmaProfesionalComponent {
    @Input()
    set profesional(value: IProfesional) {
        if (value) {
            this._profesional = value;
            this.loadFirma();
        }
    }
    get profesional() {
        return this._profesional;
    }
    @Output() onFileUploaded = new EventEmitter();
    private _profesional = null;
    public binaryString = null;
    public urlFirma = null;
    public base64textString = '';
    public base64textStringAdmin = '';
    public loading = false;
    public extensiones = IMAGENES_EXT;
    public disabledCargar = false;

    constructor(
        private imageCompress: NgxImageCompressService,
        public sanitizer: DomSanitizer,
        private plex: Plex,
        private profesionalService: ProfesionalService
    ) { }

    loadFirma() {
        if (this.profesional.id) {
            this.profesionalService.getFirma({ id: this.profesional.id }).pipe(
                catchError(() =>
                    of(null))).subscribe(resp => {
                this.urlFirma = resp.length ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp) : null;
            });
        }
    }

    getExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    onImageChange(event) {
        event.stopPropagation();
        this.disabledCargar = true;
        const image = event.target.files[0];
        if (image) {
            this.loading = true;
            const ext = this.getExtension(image.name);
            if (!this.extensiones.find(i => i === ext.toLowerCase())) {
                this.plex.toast('danger', 'Tipo de archivo incorrecto');
                return;
            }
            const reader = new FileReader();
            reader.onload = this.handleReaderLoaded.bind(this);
            reader.readAsBinaryString(image);
            this.disabledCargar = false;
        }
    }

    handleReaderLoaded(readerEvt) {
        this.imageCompress.uploadFile().then(({ image, orientation }) => {
            this.imageCompress.compressFile(image, orientation, 50, 50).then(compressedImg => {
                this.loading = false;
                // this.binaryString = readerEvt.target.result;
                this.base64textString = btoa(compressedImg);
                this.urlFirma = compressedImg; // this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
                this.onFileUploaded.emit(this.base64textString);
            },
            () => {
                this.plex.toast('danger', 'Ha ocurrido un error realizando la operación.');
                this.disabledCargar = false;
            });
        },
        () => {
            this.plex.toast('danger', 'Ha ocurrido un error realizando la operación.');
            this.disabledCargar = false;
        });
    }
}
