import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { getSemanticClass } from '../../pipes/semantic-class.pipes';

@Component({
    selector: 'huds-antecedentes-familiares',
    templateUrl: 'huds-antecedentes-familiares.html',
    styleUrls: []
})

export class HudsAntecedentesFamiliaresComponent implements OnChanges {
    @Input() paciente: IPaciente;
    public antecedentesF = [];
    public busqueda = '';
    public antecedenteExpandido;

    get antecedentesFiltrados() {
        const searchTerm = this.normalizarCadena(this.busqueda || '');
        if (!searchTerm) {
            return this.antecedentesF;
        }
        const tokens = searchTerm.split(' ');
        return this.antecedentesF.filter(antecedente => {
            const term = antecedente.registro?.concepto?.term || '';
            const profesional = antecedente.profesional?.nombreCompleto || '';
            const documento = antecedente.profesional?.documento || '';
            const texto = this.normalizarCadena(`${term} ${profesional} ${documento}`);
            return tokens.every(token => texto.includes(token));
        });
    }

    constructor(
        public hudsService: HUDSService,
        public prestacionesService: PrestacionesService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente && this.paciente?.id) {
            this.cargarAntecedentesFamiliares();
        }
    }

    cargarAntecedentesFamiliares() {
        this.antecedenteExpandido = null;
        this.hudsService.getAntecedentesFamiliares(this.paciente.id).subscribe(antecedentes => {
            this.antecedentesF = antecedentes;
        });
    }

    toggleAcordeon(trastorno, active) {
        this.antecedenteExpandido = active ? trastorno : null;
    }

    verAntecedente(antecedente) {
        this.prestacionesService.getUnConceptoPaciente(this.paciente.id, antecedente.registro.concepto).subscribe(registro => {
            if (registro) {
                registro.class = getSemanticClass(registro.concepto, false);
                this.hudsService.open(registro, 'concepto');
            }
        });
    }

    normalizarCadena(cadena: string) {
        return cadena
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

}
