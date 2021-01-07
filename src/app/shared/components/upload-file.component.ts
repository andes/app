import { environment } from '../../../environments/environment';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from '@angular/common/http';
import { Plex } from '@andes/plex';


export interface IProgress {
    loaded: Number;
    total: Number;
}

export interface ICompleted {
    status: Number;
    body: Object | Array<Object>;
}

@Component({
    selector: 'upload-file',
    template: `
        <input style="visibility: hidden; position: absolute;" type="file" (change)="onChange($event)" #upload>
        <plex-button type="info" [label]="btnLabel" (click)="upload.click()" [disabled]="disabled"></plex-button>
    `,
})

export class UploadFileComponent {
    @Input() label = 'SUBIR';
    @Input() extensiones: string[] = null;
    @Input() modulo: string = null;

    @Output() onProgress = new EventEmitter<IProgress>();
    @Output() onUpload = new EventEmitter<ICompleted>();
    @ViewChild('upload', { static: true }) uploadElement: ElementRef;

    public disabled = false;
    public currentFileUpload: File;
    public progress = 0;
    constructor(
        private http: HttpClient,
        private plex: Plex
    ) {

    }

    public get btnLabel() {
        if (this.disabled) {
            return this.progress + '%';
        } else {
            return this.label;
        }
    }

    getExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    public onChange($event) {
        $event.stopPropagation();
        this.disabled = true;
        const selectedFile = $event.target.files;
        this.currentFileUpload = selectedFile.item(0);

        if (this.extensiones) {
            const ext = this.getExtension(this.currentFileUpload.name);
            if (!this.extensiones.find(i => i === ext)) {
                this.disabled = false;
                this.uploadElement.nativeElement.value = null;
                this.plex.toast('danger', 'Tipo de archivo incorrecto');
                return;
            }

        }
        this.portFile(this.currentFileUpload).subscribe(event => {
            if (event.type === HttpEventType.UploadProgress) {
                const { loaded, total } = event;
                this.onProgress.emit({ loaded, total });
                this.progress = Math.round(loaded / total * 100);
            }
            if (event.type === HttpEventType.Response) {
                this.disabled = false;
                this.uploadElement.nativeElement.value = null;
                const status = event.status;
                let body = JSON.parse(event.body as string);
                body.ext = this.getExtension(this.currentFileUpload.name);
                if (status >= 200 && status < 300) {
                    this.onUpload.emit({ status, body });
                }
            }
        }, (error) => {
            this.disabled = false;
        });
    }

    portFile(file: File) {
        const formdata: FormData = new FormData();
        formdata.append('file', file);
        if (this.modulo) {
            formdata.append('origen', this.modulo);
        }
        const headers: HttpHeaders = new HttpHeaders({
            'Authorization': 'JWT ' + window.sessionStorage.getItem('jwt')
        });

        const req = new HttpRequest('POST', `${environment.API}/drive`, formdata, {
            reportProgress: true,
            responseType: 'text',
            headers: headers
        });
        return this.http.request(req);
    }


}
