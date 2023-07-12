import { Component, Input, OnInit, } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { environment } from '../../../../../environments/environment';
import { RupElement } from '../elementos';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';
@Component({
    selector: 'rup-adjuntar-documento',
    templateUrl: 'adjuntarDocumento.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
@RupElement('AdjuntarDocumentoComponent')
export class AdjuntarDocumentoComponent extends RUPComponent implements OnInit {
    @Input() permiteCarga: boolean;
    @Input() parametroRegistro;

    imagenes = IMAGENES_EXT;
    extensions = [...FILE_EXT, ...IMAGENES_EXT];

    adjunto: any;
    loading = false;
    waiting = false;
    timeout = null;
    errorExt = false;
    uploadValid = true;

    // fotos: { file?: any, ext: string, id?: any, descripcion?: ISnomedConcept, fecha?: Date }[] = [];
    fileToken: String = null;

    public descendientesInformeClinico: ISnomedConcept[] = [];
    public hoy = moment().endOf('day').toDate();

    ngOnInit() {
        if (this.permiteCarga === undefined) {
            this.permiteCarga = true;
        }

        if (this.parametroRegistro) {
            this.registro = this.parametroRegistro;
        }
        if (!this.registro?.valor) {
            this.registro.valor = {};
        }
        if (!this.registro?.valor.documentos) {
            this.registro.valor.documentos = [];
        }

        this.adjuntosService.token$.subscribe((data: any) => {
            this.fileToken = data.token;
        });

        this.snomedService.getQuery({ expression: '^4681000013102' }).subscribe(result => {
            this.descendientesInformeClinico = result;
            this.descendientesInformeClinico.sort((a, b) => a.term.localeCompare(b.term));
        });
    }

    onValidate() {
        if (this.params?.required) {
            this.uploadValid = this.registro.valor.documentos.length > 0;
            return this.uploadValid;
        }
        return true;
    }

    isEmpty() {
        return this.registro.valor.documentos.length === 0;
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    imageRemoved(doc) {
        this.driveService.deleteFile(doc.id).subscribe(() => {
            const index = this.registro.valor.documentos.indexOf(doc);
            this.registro.valor.documentos.splice(index, 1);
        });
    }

    createUrl(doc) {
        if (doc.id) {
            const apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }

    fromMobile() {
        const paciente = this.paciente ? this.paciente.id : null;
        const prestacion = this.prestacion.id;
        const registro = this.registro.id;
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
                const docs = this.adjunto.valor.documentos;
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

    documentos() {
        if (this.registro.valor?.documentos) {
            return this.registro.valor.documentos.map((doc) => {
                doc.url = this.createUrl(doc);

                return doc;
            });
        } else {
            return [];
        }
    }

    onUpload($event) {
        const { status, body } = $event;
        if (status === 200) {
            this.registro.valor.documentos.push({
                ext: body.ext,
                id: body.id
            });
        }
    }
}
