import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Plex } from '@andes/plex';
import { Input, Component, OnInit, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';
import { DriveService } from 'src/app/services/drive.service';

@Component({
    selector: 'detalle-derivacion',
    templateUrl: './detalle-derivacion.html',
    styleUrls: ['./adjuntos.scss', './punto-inicio.scss']
})
export class DetalleDerivacionComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    public derivacion;
    public reglaSeleccionada;
    public prioridad = 'baja';
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    // Adjuntar Archivo
    errorExt = false;
    fotos: any[] = [];
    fileToken: String = null;
    public adjuntosEstado = [];
    timeout = null;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;
    public items = [
        { key: 'derivacion', label: 'DERIVACIÓN' },
        { key: 'historial', label: 'HISTORIAL' }
    ];
    public mostrar;
    public documentosEstadoUrl = [];
    public adjuntosUrl = [];

    @Input('derivacion')
    set _derivacion(value) {
        this.derivacion = value;
        this.reglaSeleccionada = {};
        this.adjuntosEstado = [];
        this.documentosEstadoUrl = [];
        this.adjuntosUrl = this.derivacion.adjuntos.map((doc) => {
            return {
                ...doc,
                url: this.derivacionService.getUrlImage(doc.id, this.fileToken)
            };
        });
        this.cargarEstado();
    }

    @Input('reglasDerivacion')
    set _reglasDerivacion(value) {
        this.reglasDerivacion = value;
    }

    @Output() returnDetalle: EventEmitter<any> = new EventEmitter<any>();
    public tabIndex = 0;
    organizacionesDestino = [];
    reglasDerivacion = [];
    reglasDerivacionFiltradas = [];
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
        private auth: Auth,
        public plex: Plex,
        public driveService: DriveService
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
            estado: this.derivacion.estado,
            observacion: ''
        };
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(org => {
            if (org.esCOM) {
                this.esCOM = true;
            }
            this.filterReglasDerivaciones();
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

    filterReglasDerivaciones() {
        if (this.esCOM || this.derivacion.organizacionDestino.id === this.auth.organizacion.id) {
            this.reglasDerivacionFiltradas = this.reglasDerivacion.filter(element => element.estadoInicial === this.derivacion.estado &&
                element.soloCOM === this.esCOM);
        }
    }

    setPrioridad(prioridad) {
        this.prioridad = prioridad;
    }

    actualizarEstado($event) {
        if ($event.formValid) {
            this.nuevoEstado.estado = this.reglaSeleccionada.estadoFinal;
            this.nuevoEstado.adjuntos = this.adjuntosEstado;
            if (this.reglaSeleccionada.definePrioridad) {
                this.nuevoEstado.prioridad = this.prioridad;
            }
            this.derivacion.organizacionDestino = this.nuevoEstado.organizacionDestino;

            let body: any = {
                estado: this.nuevoEstado,
                trasladoEspecial: {
                    tipoTraslado: this.derivacion.tipoTraslado,
                    organizacionTraslado: this.derivacion.organizacionTraslado
                }
            };

            this.derivacionService.updateHistorial(this.derivacion._id, body).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnDetalle.emit(true);
            });
        }
    }

    // Adjuntar archivo
    onUpload($event) {
        if ($event.status === 200) {
            this.adjuntosEstado.push({
                ext: $event.body.ext,
                id: $event.body.id
            });
            this.calcDocumentosUrl();
        }
    }

    removeFile($event) {
        this.driveService.deleteFile($event.id).subscribe(() => {
            const index = this.adjuntosEstado.findIndex(a => a.id === $event.id);
            this.adjuntosEstado.splice(index, 1);
            this.calcDocumentosUrl();
        });
    }

    calcDocumentosUrl() {
        this.documentosEstadoUrl = this.adjuntosEstado.map((doc) => {
            return {
                ...doc,
                url: this.derivacionService.getUrlImage(doc.id, this.fileToken)
            };
        });
    }

    cerrar() {
        this.returnDetalle.emit(false);
    }
}
