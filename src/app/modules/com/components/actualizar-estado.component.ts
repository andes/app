import { Plex } from '@andes/plex';
import { FILE_EXT, IMAGENES_EXT } from '@andes/shared';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DriveService } from 'src/app/services/drive.service';
import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { AdjuntosService } from './../../rup/services/adjuntos.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

@Component({
    selector: 'actualizar-estado',
    templateUrl: './actualizar-estado.html',
    styleUrls: ['./adjuntos.scss', './punto-inicio.scss']
})
export class ActualizarEstadoDerivacionComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    public derivacion;
    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    fileToken: string = null;
    timeout = null;
    adjuntosEstado;
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;
    public nuevoEstado;
    public documentosUrl = [];
    public dispositivo = null;
    public oxigeno = 'oxigeno';
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'intermedia', label: 'Intermedia' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    @Input() esCOM = false;
    public financiador;
    public financiadorActual;
    public paciente: any;
    @Input('derivacion')
    set _derivacion(value) {
        this.nuevoEstado = {
            observacion: '',
            prioridad: value.prioridad
        };
        this.dispositivo = value.dispositivo;
        this.financiador = value.paciente?.ObraSocial || value.paciente?.obraSocial || value.obraSocial || null;
        this.financiadorActual = this.financiador;
        this.adjuntosEstado = [];
        this.derivacion = value;
        if (value?.paciente?.id) {
            this.pacienteService.getById(value.paciente.id).subscribe((pac: any) => this.paciente = pac);
        }
    }

    @Output() returnEditarEstado: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,
        private derivacionService: DerivacionesService,
        public plex: Plex,
        private driveService: DriveService,
        private pacienteService: PacienteService
    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    actualizarEstado($event) {
        if ($event.formValid) {
            this.nuevoEstado.adjuntos = this.adjuntosEstado;

            if (this.derivacion.prioridad === this.nuevoEstado.prioridad) {
                delete this.nuevoEstado.prioridad;
            }

            const obraSocialOrigen = this.financiadorActual || this.derivacion.paciente?.ObraSocial || this.derivacion.paciente?.obraSocial || this.derivacion.obraSocial || null;
            if (JSON.stringify(this.financiador || null) !== JSON.stringify(obraSocialOrigen || null)) {
                const valorOS = this.financiador?.nombre === 'Sin obra social' ? null : this.financiador;
                this.nuevoEstado.ObraSocial = valorOS;
                this.nuevoEstado.obraSocial = valorOS;
                this.nuevoEstado.paciente = { ObraSocial: valorOS, obraSocial: valorOS };
            }

            const body: any = { estado: this.nuevoEstado };
            this.derivacionService.updateHistorial(this.derivacion._id, body).subscribe(() => {
                this.plex.toast('success', 'La derivación fue actualizada exitosamente');
                this.returnEditarEstado.emit(true);
            });
        }
    }

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
        this.documentosUrl = this.adjuntosEstado.map((doc) => {
            return {
                ...doc,
                url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
            };
        });
    }

    cerrar() {
        this.returnEditarEstado.emit(false);
    }

    setFinanciador(financiador) {
        this.financiador = financiador;
    }
}
