import { environment } from '../../../environments/environment';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from '@angular/common/http';


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
        <input style="visibility: hidden;" type="file" (change)="onChange($event)" #upload>
        <plex-button type="info" [label]="btnLabel" (click)="upload.click()" [disabled]="disabled"></plex-button>
    `,
})

export class UploadFileComponent {
    @Input() label = 'SUBIR';

    @Output() onProgress = new EventEmitter<IProgress>();
    @Output() onUploaded = new EventEmitter<ICompleted>();
    @ViewChild('upload') uploadElement: ElementRef;

    private disabled = false;
    private currentFileUpload: File;
    private progress = 0;
    constructor(private http: HttpClient) {

    }

    public get btnLabel () {
        if (this.disabled) {
            return this.progress + '%';
        } else {
            return this.label;
        }
    }

    public onChange ($event) {
        this.disabled = true;
        const selectedFile = $event.target.files;
        this.currentFileUpload = selectedFile.item(0);

        this.portFile(this.currentFileUpload).subscribe(event => {
            if (event.type === HttpEventType.UploadProgress) {
                const { loaded, total } = event;
                this.onProgress.emit({ loaded, total });
                this.progress = Math.round(loaded / total * 100);
            }
            if (event.type === HttpEventType.Response) {
                this.disabled = false;
                const { status, body } = event;
                this.onUploaded.emit({ status, body: JSON.parse(body as string) });
                this.uploadElement.nativeElement.value = null;

            }
        });
    }

    portFile(file: File) {
        const formdata: FormData = new FormData();
        formdata.append('file', file);
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
