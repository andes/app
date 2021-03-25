import { PlexVisualizadorService } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';



export interface FileObject {
    id?: string;
    nombre?: string;
    url: string;
    ext: string;
    isImage?: boolean;
}

export const IMAGENES_EXT = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];

export const FILE_EXT = [
    // Documentos
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
    // Audio/Video
    'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
    // Otros
    'dat'
];

@Component({
    selector: 'shared-galeria-archivos',
    templateUrl: './galeria-archivos.component.html',
})
export class GaleriaArchivosComponent {
    private _files;


    get files(): FileObject[] {
        return this._files;
    }

    @Input()
    set files(value: FileObject[]) {
        if (!value) {
            this._files = [];
            return;
        }
        this._files = value.map(file => {
            return {
                ...file,
                isImage: this.esImagen(file.ext)
            };
        });
    }

    @Input() loading: boolean;

    @Input() readonly = false;

    @Output() remove = new EventEmitter<FileObject>();

    imagenes = IMAGENES_EXT;

    extensions = FILE_EXT;

    constructor(
        private plexVisualizador: PlexVisualizadorService
    ) {

    }

    onRemove(archivo: FileObject) {
        this.remove.emit(archivo);
    }


    esImagen(extension: string) {
        return !!this.imagenes.find(x => x === extension.toLowerCase());
    }


    openUrl(archivo: FileObject) {
        window.open(archivo.url);
    }

    open(index: number) {
        this.plexVisualizador.open(this.files, index);
    }


}
