import { Component, Output, Input, EventEmitter, OnInit, ViewChildren, QueryList } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'rup-adjuntar-documento',
    templateUrl: 'adjuntarDocumento.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class AdjuntarDocumentoComponent extends RUPComponent implements OnInit {

    adjunto: any;
    loading = false;
    waiting = false;
    timeout = null;

    fotos: any[] = [];
    lightbox = false;
    indice;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.documentos) {
            this.registro.valor.documentos = [];
            this.fotos = [];
        } else {
            this.registro.valor.documentos.forEach((item: any) => {
                this.fotos.push({
                    ext: item.ext,
                    file: this.sanitazer.bypassSecurityTrustResourceUrl(item.plain64)
                });
            });
        }

    }

    changeListener($event) : void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            let foto = {
                ext:  this.fileExtension(inputValue.value),
                file:  this.sanitazer.bypassSecurityTrustResourceUrl(myReader.result)
            };
            this.fotos.push(foto);
            this.registro.valor.documentos.push({
                ext:  this.fileExtension(inputValue.value),
                plain64: myReader.result
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

    imageUploaded($event) {
        let foto = {
            ext:  this.fileExtension($event.file.name),
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
        this.lightbox = true;
        this.indice = index;
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

    fromMobile () {
        let paciente = this.paciente.id;
        let prestacion = this.prestacion.id;
        let registro = this.registro;
        this.loading = true;
        this.adjuntosService.post({paciente, prestacion, registro}).subscribe((data) => {
            this.adjunto = data;
            this.waiting = true;
            this.loading = false;

            this.timeout = setTimeout( (() => {
                this.backgroundSync();
            }).bind(this) , 5000);

        });
    }

    backgroundSync () {
        this.adjuntosService.get({ id: this.adjunto.id, estado: 'upload' }).subscribe((data) => {
            if (data.length > 0) {
                this.waiting = false;
                this.adjunto = data[0];
                let docs = this.adjunto.registro.valor.documentos;
                docs.forEach((item) => {
                    if (item.ext === 'pdf') {
                        item.plain64 = item.plain64.replace('image/*', 'application/pdf');
                    } else {
                        item.plain64 = item.plain64.replace('image/*', 'image/jpeg');
                    }
                    let e = {
                        ext: item.ext,
                        file:  this.sanitazer.bypassSecurityTrustResourceUrl(item.plain64),
                    };
                    this.fotos.push(e);
                    this.registro.valor.documentos.push({
                        ext:  item.ext,
                        plain64: item.plain64
                    });

                });
                this.adjuntosService.delete(this.adjunto._id).subscribe(() => {

                });
                // let file: string = this.registro.valor[0].file as string;
                // file = file.replace('image/*', 'application/octet-stream');
                // window.open(file);

            } else {
                this.timeout = setTimeout( (() => {
                    this.backgroundSync();
                }).bind(this) , 5000);
            }
        });
    }

    cancelar () {
        clearTimeout(this.timeout);
        this.waiting = false;
    }

}
