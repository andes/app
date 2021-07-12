import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from '../../../interfaces/IProfesional';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../../services/profesional.service';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { IMAGENES_EXT } from '@andes/shared';

@Component({
    selector: 'app-firma-profesional',
    templateUrl: 'firma-profesional.html',
    styleUrls: ['firma-profesional.scss']
})
export class FirmaProfesionalComponent {
    @Input('profesional')
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
    public base64textString: String = '';
    public base64textStringAdmin: String = '';
    public loading = false;
    public extensiones = IMAGENES_EXT;
    public disabledCargar = false;

    constructor(
        private ng2ImgMax: Ng2ImgMaxService,
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
        }
        this.ng2ImgMax.resizeImage(image, 400, 300).subscribe(
            result => {
                this.loading = false;
                const reader = new FileReader();
                reader.onload = this.handleReaderLoaded.bind(this);
                reader.readAsBinaryString(result);
                this.disabledCargar = false;
            },
            error => {
                this.plex.toast('danger', 'Ha ocurrido un error realizando la operación.');
                this.disabledCargar = false;
            }
        );
    }

    handleReaderLoaded(readerEvt) {
        this.binaryString = readerEvt.target.result;
        this.base64textString = btoa(this.binaryString);
        this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
        this.onFileUploaded.emit(this.base64textString);
    }
}
