import { Plex, PlexVisualizadorService } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';



export interface FileObject {
    id?: string;
    nombre?: string;
    url: string;
    ext: string;
    isImage?: boolean;
    isDocument?: boolean;
    isVideo?: boolean;
    size?: number;
}

export const IMAGENES_EXT = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];

export const FILE_EXT = [
    // Documentos
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',

];

export const VIDEO_EXT = [
    // Audio/Video
    'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
    // Otros
    'dat'
];

@Component({
    selector: 'shared-galeria-archivos',
    templateUrl: './galeria-archivos.component.html',
    styleUrls: ['galeria-archivos.scss'],
})
export class GaleriaArchivosComponent {
    private _files;


    get files(): FileObject[] {
        return this._files;
    }

    @Input() modulo = '';
    @Input() file: FileObject;
    @Input()
    set files(value: FileObject[]) {
        if (!value) {
            this._files = [];
            return;
        }
        this._files = value.map(file => {
            return {
                ...file,
                isImage: this.verificarImagen(file.ext),
                isDocument: this.verificarDocumento(file.ext),
                isVideo: this.verificarVideo(file.ext),
            };
        });
    }

    @Input() loading: boolean;

    @Input() readonly = false;

    @Output() remove = new EventEmitter<FileObject>();

    imagenes = IMAGENES_EXT;

    documentos = FILE_EXT;

    videos = VIDEO_EXT;

    constructor(
        private plexVisualizador: PlexVisualizadorService,
        public plex: Plex,
    ) {

    }

    onRemove(archivo: FileObject) {
        this.plex.confirm('¿Desea eliminar este archivo?', 'Atención').then(confirmacion => {
            if (confirmacion) {
                this.remove.emit(archivo);
            }
        });

    }

    verificarImagen(extension: string) {
        return !!this.imagenes.find(x => x === extension.toLowerCase());
    }

    verificarDocumento(extension: string) {
        return !!this.documentos.find(x => x === extension.toLowerCase());
    }

    verificarVideo(extension: string) {
        return !!this.videos.find(x => x === extension.toLowerCase());
    }


    openUrl(archivo: FileObject) {
        window.open(archivo.url);
    }

    open(index: number) {
        const arrayImagenes = this.files.filter(file => (!this.videos.includes(file.ext) && !this.documentos.includes(file.ext)));

        if (this.files.length !== arrayImagenes.length) {
            index = index - this.cantidadVideosyPDFs(index);
        }
        this.plexVisualizador.open(arrayImagenes, index);
    }
    openFile() {
        const files: FileObject[] = [];
        files.push(this.file);
        this.plexVisualizador.open(files, 0);
    }
    cantidadVideosyPDFs(index: number) {
        const arrayAcotado = this.files.slice(0, index + 1);
        let cantVideoyPdfs = 0;
        arrayAcotado.forEach(file => {
            if (this.videos.includes(file.ext) || this.documentos.includes(file.ext)) {
                cantVideoyPdfs = cantVideoyPdfs + 1;
            }
        });
        return cantVideoyPdfs;
    }

}
