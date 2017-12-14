import { Component, Output, Input, EventEmitter, OnInit, ViewChildren, QueryList } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'rup-adjuntar-documento',
    templateUrl: 'adjuntarDocumento.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class AdjuntarDocumentoComponent extends RUPComponent implements OnInit {

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

    fotos: any[] = [];
    lightbox = false;
    indice;
    fileToken: String = null;

    ngOnInit() {

        this.extensions = this.extensions.concat(this.imagenes);

        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.documentos) {
            this.registro.valor.documentos = [];
            this.fotos = [];
        } else {
            this.registro.valor.documentos.forEach((item: any) => {
                this.fotos.push(item);
            });
        }
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });

    }

    changeListener($event): void {
        this.readThis($event.target);
    }


    readThis(inputValue: any): void {
        let ext = this.fileExtension(inputValue.value);
        this.errorExt = false;
        if (!this.extensions.find((item) => item === ext.toLowerCase())) {
            this.errorExt = true;
            return;
        }
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            let metadata = {
                prestacion: this.prestacion.id,
                registro: this.registro.id
            };
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.fotos.push({
                    ext,
                    id: data._id
                });
                this.registro.valor.documentos.push({
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

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    imageUploaded($event) {
        let foto = {
            ext: this.fileExtension($event.file.name),
            file: $event.src,
        };
        this.fotos.push(foto);
    }

    imageRemoved($event) {
        let index = this.fotos.indexOf($event);
        this.fotos.splice(index, 1);
        this.registro.valor.documentos.splice(index, 1);
    }

    activaLightbox(index) {
        if (this.fotos[index].ext !== 'pdf') {
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
        if (imagenSiguiente <= this.fotos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }

    createUrl(id) {
        /** Hack momentaneo */
        // let jwt = window.sessionStorage.getItem('jwt');
        let apiUri = environment.API;
        return apiUri + '/modules/rup/store/' + id + '?token=' + this.fileToken;
    }

    fromMobile() {
        let paciente = this.paciente.id;
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

                    this.fotos.push(item);

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

}
