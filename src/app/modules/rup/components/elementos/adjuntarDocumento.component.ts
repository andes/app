import { Component, Output, Input, EventEmitter, OnInit, ViewChildren, QueryList } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { environment } from '../../../../../environments/environment';
import { RupElement } from '../elementos';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';
import { isUndefined } from 'util';
@Component({
    selector: 'rup-adjuntar-documento',
    templateUrl: 'adjuntarDocumento.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
@RupElement('AdjuntarDocumentoComponent')
export class AdjuntarDocumentoComponent extends RUPComponent implements OnInit {
    @Input() permiteCarga: boolean;
    @Input() parametroRegistro;

    @ViewChildren('upload') childsComponents: QueryList<any>;
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Audio/Video
        'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
        // Otros
        'dat'
    ];

    adjunto: any;
    loading = false;
    waiting = false;
    timeout = null;
    errorExt = false;
    uploadValid = true;

    // fotos: { file?: any, ext: string, id?: any, descripcion?: ISnomedConcept, fecha?: Date }[] = [];
    lightbox = false;
    indice;
    fileToken: String = null;

    public descendientesInformeClinico: ISnomedConcept[] = [];
    public hoy = moment(new Date()).endOf('day').toDate();

    ngOnInit() {

        if (isUndefined(this.permiteCarga)) {
            this.permiteCarga = true;
        }

        this.extensions = this.extensions.concat(this.imagenes);

        if (!isUndefined(this.parametroRegistro)) {
            this.registro = this.parametroRegistro;
        }
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.documentos) {
            this.registro.valor.documentos = [];
        }
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });

        this.snomedService.getQuery({ expression: '^4681000013102' }).subscribe(result => {
            this.descendientesInformeClinico = result;
        });
    }

    onValidate() {
        if (!this.params?.required) {
            this.uploadValid = this.registro.valor.documentos.length > 0;
            return this.uploadValid;
        }
        return true;
    }

    isEmpty() {
        return this.registro.valor.documentos.length === 0;
    }

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
            let metadata = {
                prestacion: this.prestacion.id,
                registro: this.registro.id
            };
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.registro.valor.documentos.push({
                    ext,
                    id: data._id,
                });
            });


        };
        myReader.readAsDataURL(file);
        this.uploadValid = true;
    }


    fileExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    imageRemoved($event) {
        let index = this.registro.valor.documentos.indexOf($event);
        this.registro.valor.documentos.splice(index, 1);
    }

    activaLightbox(index) {
        if (this.registro.valor.documentos[index].ext !== 'pdf') {
            this.lightbox = true;
            this.indice = index;
        }
    }

    imagenPrevia(i) {
        let imagenPrevia = i - 1;
        if (imagenPrevia >= 0) {
            this.indice = imagenPrevia;
        }
    }

    imagenSiguiente(i) {
        let imagenSiguiente = i + 1;
        if (imagenSiguiente <= this.registro.valor.documentos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }

    createUrl(doc) {
        /** Hack momentaneo */
        // let jwt = window.sessionStorage.getItem('jwt');
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }

    fromMobile() {
        let paciente = this.paciente ? this.paciente.id : null;
        let prestacion = this.prestacion.id;
        let registro = this.registro.id;
        this.loading = true;
        this.adjuntosService.post({ paciente, prestacion, registro }).subscribe((data) => {
            this.adjunto = data;
            this.waiting = true;
            this.loading = false;

            this.timeout = setTimeout((() => {
                this.backgroundSync();
            }).bind(this), 5000);

        });
    }

    backgroundSync() {
        this.adjuntosService.get({ id: this.adjunto.id, estado: 'upload' }).subscribe((data) => {
            if (data.length > 0) {
                this.waiting = false;
                this.adjunto = data[0];
                let docs = this.adjunto.valor.documentos;
                docs.forEach((item) => {
                    this.registro.valor.documentos.push(item);
                });
                this.adjuntosService.delete(this.adjunto._id).subscribe(() => { });

            } else {
                this.timeout = setTimeout((() => {
                    this.backgroundSync();
                }).bind(this), 5000);
            }
        });
    }

    cancelar() {
        clearTimeout(this.timeout);
        this.waiting = false;
        this.adjuntosService.delete(this.adjunto._id).subscribe(() => { });
    }

    get documentos() {
        if (this.registro.valor && this.registro.valor.documentos) {
            return this.registro.valor.documentos.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }
}
// ElementosRUPRegister.register('AdjuntarDocumentoComponent', AdjuntarDocumentoComponent);
