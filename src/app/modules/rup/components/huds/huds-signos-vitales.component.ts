import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { VacunasService } from 'src/app/services/vacunas.service';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ResumenPacienteDinamicoService } from '../../services/resumenPaciente-dinamico.service';

@Component({
    selector: 'huds-signos-vitales',
    templateUrl: 'huds-signos-vitales.html',
    styleUrls: ['huds-signos-vitales.scss']
})

export class HudsSignosVitalesComponent implements OnInit {
    @Input() paciente: IPaciente;

    public signosVitalesAdultos = [
        { id: 'seguimientoPeso', nombre: 'Seguimiento de peso', tipo: 'grafico', concepto: { conceptId: '307818003', fsn: 'seguimiento del peso (régimen/tratamiento)', semanticTag: 'régimen/tratamiento', term: 'seguimiento del peso' } },
        { id: 'monitorizacionTalla', nombre: 'Monitorización de talla', tipo: 'grafico', concepto: { conceptId: '710996002', fsn: 'seguimiento de la talla (régimen/tratamiento)', semanticTag: 'régimen/tratamiento', term: 'seguimiento de la talla' } },
        { id: 'monitoreoSanguineo', nombre: 'Monitoreo de la tensión sanguínea', tipo: 'grafico', concepto: { conceptId: '135840009', fsn: 'control de la tensión arterial (régimen/tratamiento)', semanticTag: 'régimen/tratamiento', term: 'monitoreo de la tensión arterial' } },
        { id: 'depuracionRenal', nombre: 'Depuración renal', tipo: 'grafico', concepto: { conceptId: '70443007', fsn: 'medición de depuración renal (procedimiento)', semanticTag: 'procedimiento', term: 'medición de depuración renal' } },
        { id: 'temperaturaCorporal', nombre: 'Temperatura corporal', tipo: 'grafico', concepto: { conceptId: '211000246108', fsn: 'curva de temperatura corporal (elemento de registro)', semanticTag: 'elemento de registro', term: 'curva de temperatura corporal' } },
        { id: 'enfermedadCardiovascular', nombre: 'Evaluación de riesgo de enfermedad cardiovascular', tipo: 'registro', concepto: { conceptId: '441829007', fsn: 'evaluación del riesgo de enfermedad cardiovascular (procedimiento)', semanticTag: 'procedimiento', term: 'evaluación del riesgo de enfermedad cardiovascular' } }
    ];

    public signosVitalesNinos = [
        { id: 'vacunas', nombre: 'Vacunas aplicadas' },
        { id: 'seguimientoPeso', nombre: 'Seguimiento de peso', tipo: 'curva', radio: 1 },
        { id: 'monitorizacionTalla', nombre: 'Monitorización de talla', tipo: 'curva', radio: 2 },
        { id: 'perimetroCefalico', nombre: 'Perímetro cefálico', tipo: 'curva', radio: 3 },
        { id: 'registroVisitas', nombre: 'Registro de visitas' }
    ];

    public signosVitales = [];
    public esNino = false;
    public signoSenalado;
    public grafico: IElementoRUP;
    public elemento: IElementoRUP;
    public registro: any;
    public curvaRadio: number;
    public vacunas = [];
    public prestaciones: any = [];
    public tabla: any = [];
    public graficoClave = 0;
    private vacunasCargadas = false;
    private visitasCargadas = false;

    constructor(
        public elementosRUPService: ElementosRUPService,
        public prestacionesService: PrestacionesService,
        public servicioVacunas: VacunasService,
        public servicioResumenPaciente: ResumenPacienteDinamicoService
    ) { }

    ngOnInit() {
        this.esNino = this.paciente?.edad <= 6;
        this.signosVitales = this.esNino ? this.signosVitalesNinos : this.signosVitalesAdultos;
    }

    onChangeSignoVital(event) {
        this.grafico = null;
        this.elemento = null;
        this.registro = null;
        this.curvaRadio = null;

        const signo = this.signoSenalado;
        if (!signo) {
            return;
        }

        if (this.esNino) {
            if (signo.tipo === 'curva') {
                this.curvaRadio = signo.radio;
            } else if (signo.id === 'vacunas') {
                this.cargarVacunas();
            } else if (signo.id === 'registroVisitas') {
                this.cargarVisitas();
            }
            return;
        }

        const elementoRUP = this.elementosRUPService.buscarElemento(signo.concepto, false);
        if (signo.tipo === 'grafico') {
            this.grafico = elementoRUP;
            this.graficoClave++;
        } else {
            this.cargarRegistro(signo, elementoRUP);
        }
    }

    private cargarRegistro(signo, elementoRUP?: IElementoRUP) {
        this.elemento = elementoRUP || this.elementosRUPService.buscarElemento(signo.concepto, false);
        if (!this.elemento) {
            return;
        }
        this.prestacionesService.getRegistrosHuds(this.paciente.id, '<<' + signo.concepto.conceptId).subscribe(prestaciones => {
            if (prestaciones.length) {
                this.registro = prestaciones[prestaciones.length - 1].registro;
            }
        });
    }

    private cargarVacunas() {
        if (this.vacunasCargadas) {
            return;
        }
        this.servicioVacunas.get(this.paciente.id).subscribe(resultado => {
            this.vacunas = resultado;
            this.vacunasCargadas = true;
        });
    }

    private cargarVisitas() {
        if (this.visitasCargadas) {
            return;
        }
        this.servicioResumenPaciente.get(this.paciente.id).subscribe(resultado => {
            resultado.sort((a, b) => {
                const dateA = new Date(a.fecha).getTime();
                const dateB = new Date(b.fecha).getTime();
                return dateA < dateB ? 1 : -1;
            });
            const prestacionesAux = [];
            resultado.forEach(unaPrestacion => {
                if (!prestacionesAux.find(p => p.motivo.conceptId === unaPrestacion.motivo.conceptId)) {
                    prestacionesAux.push(unaPrestacion);
                }
            });
            this.prestaciones = prestacionesAux;
            this.tabla = [];
            this.crearTabla();
            this.visitasCargadas = true;
        });
    }

    private crearTabla() {
        this.prestaciones.forEach(prestacion => {
            const filaTabla = [];
            filaTabla.push({ titulo: 'Fecha', valor: moment(prestacion.fecha).format('DD/MM/YYYY') });
            filaTabla.push({ titulo: 'Edad', valor: prestacion.motivo.term });
            prestacion.conceptos.forEach(unConcepto => {
                let unValor = null;
                if (unConcepto.contenido) {
                    const conceptoValor = unConcepto.contenido.valor;
                    unValor = Array.isArray(conceptoValor) && conceptoValor.length > 0 ? conceptoValor.filter(e => e.checkbox || e.checked).map(e => e.concepto.term).join(', ') : conceptoValor;
                }
                if (!unValor) {
                    unValor = 'S/D';
                }
                filaTabla.push({ titulo: unConcepto.titulo, valor: unValor });
            });
            this.tabla.push(filaTabla);
        });
    }
}
