import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Plex } from '@andes/plex';
import { Input, Component, OnInit, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';
import { ReglasDerivacionService } from 'src/app/services/com/reglasDerivaciones.service';

@Component({
    selector: 'detalle-derivacion',
    templateUrl: './detalle-derivacion.html',
    styleUrls: ['./adjuntos.scss']
})
export class DetalleDerivacionComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    public derivacion;
    public reglaSeleccionada;
    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    fotos: any[] = [];
    fileToken: String = null;
    timeout = null;
    adjuntosEstado = [];
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Otros
        'dat'
    ];
    public items = [
        { key: 'derivacion', label: 'DERIVACIÓN' },
        { key: 'historial', label: 'HISTORIAL' }
    ];
    public mostrar;

    @Input('derivacion')
    set _derivacion(value) {
        this.derivacion = value;
        this.cargarEstado();
    }
    @Output() returnDetalle: EventEmitter<any> = new EventEmitter<any>();
    public tabIndex = 0;
    organizacionesDestino = [];
    reglasDerivacion = [];
    public nuevoEstado: any = {
        organizacionDestino: '',
        estado: null,
        observacion: ''
    };
    public esCOM = false;

    constructor(
        public adjuntosService: COMAdjuntosService,
        public sanitazer: DomSanitizer,
        private organizacionService: OrganizacionService,
        private derivacionService: DerivacionesService,
        private reglasDerivacionService: ReglasDerivacionService,
        private auth: Auth,
        public plex: Plex
    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
        this.getOrganizacionesDerivables();
    }

    cambiarOption(opcion) {
        this.mostrar = opcion;
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/com/store/' + doc.id + '?token=' + this.fileToken;
        }
    }

    get documentos() {
        let adjuntosDerivacion = this.derivacion.adjuntos;
        if (adjuntosDerivacion) {
            return adjuntosDerivacion.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }

    cargarEstado() {
        this.nuevoEstado = {
            organizacionDestino: this.derivacion.organizacionDestino,
            estado: { id: this.derivacion.estado, nombre: this.derivacion.estado },
            observacion: ''
        };
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(org => {
            if (org.esCOM) {
                this.esCOM = true;
            }
            this.getReglasDerivaciones();
        });
    }

    getOrganizacionesDerivables() {
        let query = {
            aceptaDerivacion: true
        };
        this.organizacionService.get(query).subscribe(resultado => {
            this.organizacionesDestino = resultado.map(organizacion => {
                if (organizacion.id !== this.auth.organizacion.id) {
                    return { id: organizacion.id, nombre: organizacion.nombre, direccion: organizacion.direccion };
                }
            });
        });
    }

    getReglasDerivaciones() {
        // los efectores no pueden cambiar el estado de las derivaciones solicitadas
        if (!(this.derivacion.organizacionOrigen.id === this.auth.organizacion.id)) {
            let query: any = {
                estadoInicial: this.derivacion.estado,
                soloCOM: this.esCOM
            };
            this.reglasDerivacionService.search(query).subscribe(resultado => {
                this.reglasDerivacion = resultado;
            });
        } else {
            this.reglasDerivacion = [];
        }
    }

    actualizarEstado($event) {
        if ($event.formValid) {
            this.nuevoEstado.estado = this.reglaSeleccionada.estadoFinal;
            this.nuevoEstado.adjuntos = this.adjuntosEstado;
            this.derivacion.historial.push(this.nuevoEstado);
            this.derivacion.estado = this.nuevoEstado.estado;
            this.derivacion.organizacionDestino = this.nuevoEstado.organizacionDestino;
            this.derivacionService.update(this.derivacion._id, this.derivacion).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnDetalle.emit(true);
            });
        }
    }
    // Adjuntar archivo
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
            let metadata = {};
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.adjuntosEstado.push({
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

    removeFile($event) {
        let index = this.adjuntosEstado.indexOf($event);
        this.adjuntosEstado.splice(index, 1);
    }

    get documentosUrl() {
        return this.adjuntosEstado.map((doc) => {
            doc.url = this.createUrl(doc);
            return doc;
        });
    }

    cancelarAdjunto() {
        clearTimeout(this.timeout);
        this.waiting = false;
    }

    cerrar() {
        this.returnDetalle.emit(false);
    }
}
