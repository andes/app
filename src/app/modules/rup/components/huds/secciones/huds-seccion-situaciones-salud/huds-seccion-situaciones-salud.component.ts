import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PrestacionesService } from '../../../../services/prestaciones.service';
import { HUDSService } from 'src/app/modules/rup/services/huds.service';
import { getSemanticClass } from '../../../../pipes/semantic-class.pipes';

@Component({
    selector: 'huds-seccion-situaciones-salud',
    templateUrl: 'huds-seccion-situaciones-salud.html',
    styleUrls: ['huds-seccion-situaciones-salud.scss']
})
export class HudsSeccionSituacionesSaludComponent implements OnChanges {
    @Input() paciente: IPaciente;

    public trastornos = [];
    public trastornoExpandido;
    public diagnosticoProfesional = '';

    get trastornosFiltrados() {
        const searchTerm = this.normalizarCadena(this.diagnosticoProfesional || '');
        if (!searchTerm) {
            return this.trastornos;
        }
        const tokens = searchTerm.split(' ');
        return this.trastornos.filter(trastorno => {
            const term = trastorno.concepto?.term || '';
            const profesional = trastorno.evoluciones?.[0]?.profesional || '';
            const texto = this.normalizarCadena(`${term} ${profesional}`);
            return tokens.every(token => texto.includes(token));
        });
    }

    constructor(
        public prestacionesService: PrestacionesService,
        public hudsService: HUDSService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente && this.paciente?.id) {
            this.cargarTrastornos();
        }
    }

    cargarTrastornos() {
        this.trastornoExpandido = null;
        this.trastornos = [];
        this.hudsService.getSituacionesActivas(this.paciente.id).subscribe(trastornos => {
            this.trastornos = trastornos;
        });
    }

    toggleAcordeon(trastorno, active) {
        this.trastornoExpandido = active ? trastorno : null;
    }

    normalizarCadena(cadena: string) {
        return cadena
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    verPrestacion(trastorno) {
        this.prestacionesService.getUnTrastornoPaciente(this.paciente.id, trastorno.concepto).subscribe(registro => {
            if (registro) {
                registro.class = getSemanticClass(registro.concepto, false);
                this.hudsService.open(registro, 'concepto');
            }
        });
    }
}
