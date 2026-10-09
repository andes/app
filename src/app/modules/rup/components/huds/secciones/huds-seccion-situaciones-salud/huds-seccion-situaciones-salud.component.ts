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
            const situacion = trastorno.situacion || '';
            const profesional = this.getProfesionalTexto(trastorno) || '';
            const texto = this.normalizarCadena(`${term} ${situacion} ${profesional}`);
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

    esEmbarazo(trastorno) {
        return trastorno?.tipo === 'embarazo';
    }

    getTitulo(trastorno) {
        if (this.esEmbarazo(trastorno)) {
            return this.capitalizar(trastorno.situacion) || 'Embarazo';
        }
        return trastorno?.concepto?.term || 'Situación sin descripción';
    }

    getSubtitulo(trastorno) {
        if (this.esEmbarazo(trastorno)) {
            return trastorno.prestacion?.solicitud?.tipoPrestacion?.term || 'Embarazo en curso';
        }
        return trastorno?.evoluciones?.[0]?.tipoPrestacion || 'Sin evolución';
    }

    getProfesionalTexto(trastorno) {
        if (this.esEmbarazo(trastorno)) {
            const profesional = trastorno.profesional;
            return profesional ? `${profesional.apellido} ${profesional.nombre}` : 'Sin profesional';
        }
        return trastorno?.evoluciones?.[0]?.profesional || 'Sin profesional';
    }

    private capitalizar(texto: string) {
        return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
    }

    verPrestacion(trastorno) {
        if (this.esEmbarazo(trastorno)) {
            if (trastorno.prestacion) {
                this.hudsService.open(trastorno.prestacion, 'rup');
            } else if (trastorno.idPrestacion) {
                this.prestacionesService.getById(trastorno.idPrestacion).subscribe(prestacion => {
                    if (prestacion) {
                        this.hudsService.open(prestacion, 'rup');
                    }
                });
            }
            return;
        }
        if (!trastorno?.concepto) {
            return;
        }
        this.prestacionesService.getUnTrastornoPaciente(this.paciente.id, trastorno.concepto).subscribe(registro => {
            if (registro) {
                registro.class = getSemanticClass(registro.concepto, false);
                this.hudsService.open(registro, 'concepto');
            }
        });
    }
}
