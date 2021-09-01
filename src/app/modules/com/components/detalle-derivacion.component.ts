import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { FILE_EXT, IMAGENES_EXT } from '@andes/shared';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DocumentosService } from 'src/app/services/documentos.service';
import { DriveService } from 'src/app/services/drive.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { AdjuntosService } from '../../rup/services/adjuntos.service';
import { PrestacionesService } from '../../rup/services/prestaciones.service';
import { DerivacionesService } from './../../../services/com/derivaciones.service';

@Component({
    selector: 'detalle-derivacion',
    templateUrl: './detalle-derivacion.html',
    styleUrls: ['./adjuntos.scss', './punto-inicio.scss']
})
export class DetalleDerivacionComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    public derivacion;
    public reglaSeleccionada;
    public dispositivo = null;
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'intermedia', label: 'Intermedia' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    // Adjuntar Archivo
    errorExt = false;
    fotos: any[] = [];
    fileToken: string = null;
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
        this.dispositivo = value.dispositivo;
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
            this.reglaSeleccionada = {};
            this.adjuntosEstado = [];
            this.documentosEstadoUrl = [];
            this.adjuntosUrl = this.derivacion.adjuntos.map((doc) => {
                return {
                    ...doc,
                    url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
                };
            });
            this.cargarEstado();
        });
    }

    @Input('reglasDerivacion')
    set _reglasDerivacion(value) {
        this.reglasDerivacion = value;
    }

    @Output() returnDetalle: EventEmitter<any> = new EventEmitter<any>();
    public tabIndex = 0;
    organizacionesDestino = [];
    unidadesDestino = [];
    reglasDerivacion = [];
    reglasDerivacionFiltradas = [];
    public nuevoEstado;
    public esCOM = false;
    requestInProgress;

    constructor(
        private servicioPrestacion: PrestacionesService,
        public sanitazer: DomSanitizer,
        private organizacionService: OrganizacionService,
        private derivacionService: DerivacionesService,
        private auth: Auth,
        public plex: Plex,
        public driveService: DriveService,
        private adjuntosService: AdjuntosService,
        private documentosService: DocumentosService,
        public router: Router
    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.getOrganizacionesDerivables();
    }

    cambiarOption(opcion) {
        this.mostrar = opcion;
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    cargarEstado() {
        this.nuevoEstado = {
            organizacionDestino: this.derivacion.organizacionDestino,
            unidadDestino: this.derivacion.unidadDestino,
            estado: this.derivacion.estado,
            prioridad: this.derivacion.prioridad || 'baja',
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
        const query = {
            aceptaDerivacion: true
        };
        this.organizacionService.get(query).subscribe(resultado => {
            this.organizacionesDestino = resultado.map(organizacion => {
                return { id: organizacion.id, nombre: organizacion.nombre, direccion: organizacion.direccion };
            });
        });
    }

    resetUnidadesDestino() {
        this.nuevoEstado.unidadDestino = null;
        this.loadUnidadesDestino();
    }

    loadUnidadesDestino() {
        if (this.nuevoEstado.organizacionDestino) {
            this.organizacionService.unidadesOrganizativas(this.nuevoEstado.organizacionDestino.id).subscribe(resultado => this.unidadesDestino = resultado);
        } else {
            this.unidadesDestino = [];
        }
    }

    filterReglasDerivaciones() {
        if (this.esCOM || this.derivacion.organizacionDestino.id === this.auth.organizacion.id) {
            this.reglasDerivacionFiltradas = this.reglasDerivacion.filter(element => element.estadoInicial === this.derivacion.estado &&
                element.soloCOM === this.esCOM);
        }
    }

    onReglaChange() {
        if (this.reglaSeleccionada.estadoFinal === 'asignada') {
            this.nuevoEstado.organizacionDestino = null;
            this.nuevoEstado.unidadDestino = null;
        } else {
            this.nuevoEstado.organizacionDestino = this.derivacion.organizacionDestino;
            this.nuevoEstado.unidadDestino = this.derivacion.unidadDestino;
        }
        this.loadUnidadesDestino();
    }

    actualizarEstado($event) {
        if ($event.formValid) {
            this.nuevoEstado.estado = this.reglaSeleccionada.estadoFinal;

            this.nuevoEstado.adjuntos = this.adjuntosEstado;
            if (!this.reglaSeleccionada.definePrioridad) {
                delete this.nuevoEstado.prioridad;
            }
            this.nuevoEstado.dispositivo = this.derivacion.dispositivo;
            this.derivacion.organizacionDestino = this.nuevoEstado.organizacionDestino;
            const body: any = {
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
                url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
            };
        });
    }

    editarPrestacion() {
        this.servicioPrestacion.notificaRuta({ nombre: 'COM', ruta: 'com' });
        this.router.navigate(['rup/ejecucion', this.derivacion.prestacion]);
    }

    imprimirHistorial() {
        this.requestInProgress = true;
        const foo = () => this.requestInProgress = false;
        this.documentosService.descargarHistorialDerivacion(this.derivacion._id, this.derivacion.paciente.apellido).subscribe(foo, foo);
    }

    cerrar() {
        this.returnDetalle.emit(false);
    }
}
