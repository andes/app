import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICodificacionPrestacion } from './../../../../modules/rup/interfaces/ICodificacion';
import { CodificacionService } from './../../../../modules/rup/services/codificacion.service';
import { Subscription } from 'rxjs';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { IProfesional } from 'src/app/interfaces/IProfesional';


@Component({
    selector: 'fuera-agenda',
    templateUrl: 'fuera-agenda.html'
})
export class RevisionFueraAgendaComponent implements OnInit {
    // Propiedades privadas
    @HostBinding('class.plex-layout') layout = true;

    // Propiedades públicas
    public prestaciones: ICodificacionPrestacion[];
    public prestacionSeleccionada: ICodificacionPrestacion;
    public profesional: IProfesional;
    public showRegistros;
    public showReparo = false;
    public indiceReparo: number;
    public esAgendaOdonto = false;
    public auditadas = false;
    public diagnosticos = [];
    private lastRequest: Subscription;
    public fechaDesde: Date;
    public fechaHasta: Date;

    // Eventos
    @Output() save: EventEmitter<ICodificacionPrestacion[]> = new EventEmitter<ICodificacionPrestacion[]>();
    @Output() volverAlGestor = new EventEmitter<boolean>();

    // Constructor
    constructor(
        private servicioProfesional: ProfesionalService,
        private serviceCodificacion: CodificacionService,
        private plex: Plex
    ) { }

    // Métodos
    ngOnInit() {
        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.fechaHasta = moment(this.fechaHasta).endOf('day');
        this.cargarPrestaciones();
    }

    cargarPrestaciones() {
        if (this.fechaDesde && this.fechaHasta) {
            const params = {
                fechaDesde: moment(this.fechaDesde).startOf('day').toDate(),
                fechaHasta: moment(this.fechaHasta).endOf('day').toDate(),
                idProfesional: this.profesional?.id,
                auditadas: this.auditadas
            };
            this.serviceCodificacion.get(params).subscribe(datos => {
                this.prestaciones = datos;
            }, err => {
                this.plex.info('danger', 'Ocurrió un error cargando las prestaciones.');
            });
        }
    }

    loadProfesionales(event) {
        // cancelamos ultimo request
        if (this.lastRequest) {
            this.lastRequest = null;
        }
        if (event.query && event.query.length > 2) {
            const query = {
                nombreCompleto: event.query
            };
            this.lastRequest = this.servicioProfesional.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
    }

    estaSeleccionada(prestacion: ICodificacionPrestacion) {
        return (this.prestacionSeleccionada === prestacion);
    }

    seleccionarPrestacion(prestacion: ICodificacionPrestacion) {
        this.prestacionSeleccionada = prestacion;
        this.diagnosticos = [];
        this.showReparo = false;
        if (prestacion.diagnostico.codificaciones && prestacion.diagnostico.codificaciones.length) {
            this.diagnosticos = this.diagnosticos.concat(prestacion.diagnostico.codificaciones);
        }
    }

    mostrarReparo(index) {
        this.indiceReparo = index;
        this.showReparo = true;
    }

    /**
     * Agrega el diagnóstico provisto por el revisor, y persiste el cambio automáticamente
     *
     * @param {any} reparo
     * @memberof RevisionAgendaComponent
     */
    repararDiagnostico(reparo: any) {
        if (reparo) {
            this.diagnosticos[this.indiceReparo].codificacionAuditoria = reparo;
            this.showReparo = false;
        }
        this.onSave();
    }

    aprobar(index) {
        this.diagnosticos[index].codificacionAuditoria = this.diagnosticos[index].codificacionProfesional.cie10;
        // En el caso que aprueben el primer diagnóstico, se aprueba el resto
        if (index === 0) {
            for (let j = 1; j < this.diagnosticos.length; j++) {
                this.diagnosticos[j].codificacionAuditoria = this.diagnosticos[j].codificacionProfesional.cie10;
            }
        }
        this.onSave();
    }

    borrarReparo(index) {
        this.diagnosticos[index].codificacionAuditoria = null;
        this.showReparo = false;
        this.onSave();
    }

    onSave() {
        // Se guarda la prestación seleccionada
        if (this.diagnosticos) {
            this.prestacionSeleccionada.diagnostico.codificaciones = this.diagnosticos;
        }
        this.serviceCodificacion.patch(this.prestacionSeleccionada.id, { codificaciones: this.diagnosticos }).subscribe();
    }

    volver() {
        this.volverAlGestor.emit(true);
    }


}
