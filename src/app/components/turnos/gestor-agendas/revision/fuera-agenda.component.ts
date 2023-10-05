import { Component, OnInit, HostBinding, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { ICodificacionPrestacion } from './../../../../modules/rup/interfaces/ICodificacion';
import { CodificacionService } from './../../../../modules/rup/services/codificacion.service';
import { calcularEdad } from '@andes/shared';

@Component({
    selector: 'fuera-agenda',
    templateUrl: 'fuera-agenda.html',
    styleUrls: ['fuera-agenda.scss']
})
export class RevisionFueraAgendaComponent implements OnInit, OnChanges {
    // Propiedades privadas
    @HostBinding('class.plex-layout') layout = true;

    // Propiedades públicas
    @Input() prestacionSeleccionada: ICodificacionPrestacion;
    public showReparo = false;
    public indiceReparo: number;
    public esAgendaOdonto = false;
    public diagnosticos = [];

    private index = -1;

    public columns = [
        { 'key': 'seleccionar', 'label': '' },
        { 'key': 'primeraVez', 'label': 'Primera vez' },
        { 'key': 'desde', 'label': 'Estado' },
        { 'key': 'snomed', 'label': 'Diag. Snomed' },
        { 'key': 'cie10', 'label': 'Diag. CIE10' },
    ];

    // Eventos
    @Output() save: EventEmitter<ICodificacionPrestacion[]> = new EventEmitter<ICodificacionPrestacion[]>();
    @Output() cerrar = new EventEmitter<boolean>();

    // Constructor
    constructor(
        private serviceCodificacion: CodificacionService,
    ) { }

    // Métodos
    ngOnInit() {
        this.cargarDiagnosticos();
    }

    ngOnChanges() {
        this.index = -1;
        this.cargarDiagnosticos();
    }

    cargarDiagnosticos() {
        this.diagnosticos = [];
        if (this.prestacionSeleccionada.diagnostico.codificaciones && this.prestacionSeleccionada.diagnostico.codificaciones.length) {
            this.diagnosticos = this.diagnosticos.concat(this.prestacionSeleccionada.diagnostico.codificaciones);
        }
    }

    mostrarReparo() {
        this.indiceReparo = this.index;
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
            this.diagnosticos[this.index].codificacionAuditoria = reparo;
            this.showReparo = false;
        }
        this.onSave();
    }

    aprobar() {
        this.diagnosticos[this.index].codificacionAuditoria = this.diagnosticos[this.index].codificacionProfesional.cie10;
        // En el caso que aprueben el primer diagnóstico, se aprueba el resto
        if (this.index === 0) {
            for (let j = 1; j < this.diagnosticos.length; j++) {
                this.diagnosticos[j].codificacionAuditoria = this.diagnosticos[j].codificacionProfesional.cie10;
            }
        }
        this.onSave();
    }

    borrarReparo() {
        this.diagnosticos[this.index].codificacionAuditoria = null;
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

    edad(fechaNacimiento: Date) {
        return calcularEdad(fechaNacimiento);
    }

    seleccionarDiagnostico(index: number) {
        if (this.index >= 0 && this.index === index) {
            this.index = -1;
        } else {
            this.index = index;
        }
    }

    indexSeleccionado(index) {
        if (this.index >= 0) {
            return this.index === index;
        }
    }

    mostrarAprobarReprar() {
        if (this.index >= 0) {
            return ((this.diagnosticos[this.index].codificacionProfesional?.snomed?.codigo ||
                this.diagnosticos[this.index].codificacionProfesional?.cie10?.codigo) &&
                !this.diagnosticos[this.index].codificacionAuditoria?.codigo);
        }
    }

    mostrarRestablecer() {
        if (this.index >= 0) {
            return ((this.diagnosticos[this.index].codificacionProfesional?.snomed?.codigo ||
                this.diagnosticos[this.index].codificacionProfesional?.cie10?.codigo) &&
                this.diagnosticos[this.index].codificacionAuditoria?.codigo);
        }
    }

    volver() {
        this.cerrar.emit(true);
    }

}
