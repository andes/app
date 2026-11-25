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
    @Output() fileUploaded = new EventEmitter();
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
        if (this.profesional && this.profesional.id) {
            this.profesionalService.getFirma({ id: this.profesional.id }).pipe(
                catchError(() =>
                    of(null))).subscribe(resp => {
                this.urlFirma = resp && resp.length ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp) : null;
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
        const input = event.target as HTMLInputElement;
        const image = input.files && input.files[0];
        // Permite volver a seleccionar el mismo archivo.
        input.value = '';
        if (!image) {
            return;
        }

        const ext = this.getExtension(image.name).toLowerCase();
        if (!this.extensiones.find(i => i === ext)) {
            this.plex.toast('danger', 'Tipo de archivo incorrecto');
            return;
        }

        this.loading = true;
        this.disabledCargar = true;

        // Usamos el archivo ya elegido por el usuario. No hay que volver a abrir
        // un selector (imageCompress.uploadFile()) porque perdemos la activación
        // del usuario y el navegador bloquea el diálogo.
        const reader = new FileReader();
        reader.onload = () => this.comprimirImagen(reader.result as string, image);
        reader.onerror = () => this.errorImagen();
        reader.readAsDataURL(image);
    }

    private comprimirImagen(dataUrl: string, file: File) {
        this.imageCompress.getOrientation(file)
            .then(orientation => this.imageCompress.compressFile(dataUrl, orientation, 50, 50))
            .then(compressedImg => {
                this.loading = false;
                this.disabledCargar = false;
                // compressFile devuelve un data URL: "data:image/png;base64,XXXX"
                this.base64textString = compressedImg.split(',')[1] || '';
                this.urlFirma = this.sanitizer.bypassSecurityTrustUrl(compressedImg);
                this.fileUploaded.emit(this.base64textString);
            },
            () => this.errorImagen());
    }

    private errorImagen() {
        this.loading = false;
        this.disabledCargar = false;
        this.plex.toast('danger', 'Ha ocurrido un error realizando la operación.');
    }
}
