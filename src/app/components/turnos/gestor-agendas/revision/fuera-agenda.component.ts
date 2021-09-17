import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICodificacionPrestacion } from './../../../../modules/rup/interfaces/ICodificacion';
import { CodificacionService } from './../../../../modules/rup/services/codificacion.service';


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
    public showRegistros;
    public showReparo = false;
    public indiceReparo: number;
    public esAgendaOdonto = false;
    public auditadas = false;
    public diagnosticos = [];
    fechaDesde: Date;
    fechaHasta: Date;

    // Eventos
    @Output() save: EventEmitter<ICodificacionPrestacion[]> = new EventEmitter<ICodificacionPrestacion[]>();
    @Output() volverAlGestor = new EventEmitter<boolean>();

    // Constructor
    constructor(private plex: Plex, private serviceCodificacion: CodificacionService) { }

    // Métodos
    ngOnInit() {
        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.fechaDesde = moment(this.fechaDesde).utc().startOf('day');
        this.fechaHasta = moment(this.fechaHasta).utc().endOf('day');
        this.cargarPrestaciones();
    }

    cargarPrestaciones() {
        if (this.fechaDesde && this.fechaHasta) {
            const params = {
                fechaDesde: moment(this.fechaDesde).utc().startOf('day'),
                fechaHasta: moment(this.fechaHasta).utc().endOf('day'),
                auditadas: this.auditadas
            };
            this.serviceCodificacion.get(params).subscribe(datos => {
                this.prestaciones = datos;
            }, err => {
                if (err) {
                }
            });
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
