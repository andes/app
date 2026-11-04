import moment from 'moment';
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
        { id: 'seguimientoPeso', nombre: 'Seguimiento de peso', tipo: 'curva', radio: 1, expresion: '<<27113001', unidad: 'kg' },
        { id: 'monitorizacionTalla', nombre: 'Monitorización de talla', tipo: 'curva', radio: 2, expresion: '<<50373000 OR 14456009', unidad: 'cm' },
        { id: 'perimetroCefalico', nombre: 'Perímetro cefálico', tipo: 'curva', radio: 3, expresion: '363812007', unidad: 'cm' },
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
    public fechaDesde: Date = null;
    public fechaHasta: Date = null;
    public paramsGrafico = {};
    public hayDatosSigno = false;
    public hayDatosRango = false;
    public cargandoCurva = false;
    public cargandoRegistro = false;
    public cargandoVacunas = false;
    public cargandoVisitas = false;
    @HostBinding('class.signos-listado') public vistaListado = false;
    public cargandoListado = false;
    public listadoCompleto = [];
    public listado = [];
    public scrollEnd = false;
    private pageSize = 15;
    private listadoRequestId = 0;
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
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.paramsGrafico = {};
        this.hayDatosSigno = false;
        this.hayDatosRango = false;
        this.cargandoCurva = false;
        this.cargandoRegistro = false;
        this.vistaListado = false;
        this.cargandoListado = false;
        this.listadoCompleto = [];
        this.listado = [];
        this.scrollEnd = false;
        this.listadoRequestId++;

        const signo = this.signoSenalado;
        if (!signo) {
            return;
        }

        if (this.esNino) {
            if (signo.tipo === 'curva') {
                this.curvaRadio = signo.radio;
                this.cargandoCurva = true;
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

    mostrarFiltrosFecha() {
        const signo = this.signoSenalado;
        if (!signo) {
            return false;
        }
        if (signo.id === 'depuracionRenal') {
            return true;
        }
        if (signo.tipo === 'grafico' || signo.tipo === 'curva') {
            return this.hayDatosSigno;
        }
        return false;
    }

    onChangeFiltroFecha() {
        this.paramsGrafico = { fechaDesde: this.fechaDesde, fechaHasta: this.fechaHasta };
        if (this.vistaListado) {
            this.cargarListado();
            return;
        }
        if (this.signoSenalado?.tipo === 'grafico') {
            this.graficoClave++;
        }
        if (this.signoSenalado?.tipo === 'curva') {
            this.cargandoCurva = true;
        }
    }

    onGraficoData(hayDatos: boolean) {
        this.hayDatosRango = hayDatos;
        if (hayDatos) {
            this.hayDatosSigno = true;
        }
    }

    onCurvaData(hayDatos: boolean) {
        this.cargandoCurva = false;
        this.hayDatosRango = hayDatos;
        if (hayDatos) {
            this.hayDatosSigno = true;
        }
    }

    getSubtituloVacio() {
        return (this.fechaDesde || this.fechaHasta)
            ? 'No hay registros en el rango de fechas seleccionado'
            : 'El paciente no tiene valores registrados para este signo vital';
    }

    tieneGrafico() {
        return this.signoSenalado?.tipo === 'curva' || this.grafico?.componente === 'GraficoLinealComponent';
    }

    toggleVista() {
        this.vistaListado = !this.vistaListado;
        if (this.vistaListado) {
            this.cargarListado();
        } else {
            this.listadoRequestId++;
            this.listadoCompleto = [];
            this.listado = [];
            this.scrollEnd = false;
            this.cargandoListado = false;
            if (this.signoSenalado?.tipo === 'curva') {
                this.cargandoCurva = true;
            }
        }
    }

    onScrollListado() {
        if (this.cargandoListado || this.scrollEnd) {
            return;
        }
        this.cargarMasListado();
    }

    private getPeticionesListado() {
        if (this.signoSenalado?.tipo === 'curva') {
            return [{
                query: this.signoSenalado.expresion,
                label: this.signoSenalado.nombre,
                unidad: this.signoSenalado.unidad
            }];
        }
        if (this.signoSenalado?.tipo === 'grafico' && this.grafico?.componente === 'GraficoLinealComponent') {
            return (this.grafico.params || []).map(param => ({
                query: param.query,
                label: param.label,
                unidad: param.unidad
            }));
        }
        return [];
    }

    private cargarListado() {
        const peticiones = this.getPeticionesListado();
        const requestId = ++this.listadoRequestId;
        this.listadoCompleto = [];
        this.listado = [];
        this.scrollEnd = false;
        if (!peticiones.length) {
            this.hayDatosRango = false;
            this.cargandoListado = false;
            return;
        }
        this.cargandoListado = true;
        const consultas: Observable<any[]>[] = peticiones.map(peticion =>
            this.prestacionesService.getRegistrosHuds(this.paciente.id, peticion.query, this.fechaDesde, true, null, null, this.fechaHasta)
                .pipe(catchError(() => of([])))
        );
        forkJoin(consultas).subscribe(respuestas => {
            if (requestId !== this.listadoRequestId) {
                return;
            }
            const filas = [];
            respuestas.forEach((registros, index) => {
                const peticion = peticiones[index];
                registros.forEach(registro => {
                    const valor = registro.registro?.valor;
                    if (valor !== null && valor !== undefined && valor !== '') {
                        filas.push({
                            fecha: registro.fecha,
                            label: peticion.label,
                            valor,
                            unidad: peticion.unidad,
                            profesional: registro.profesional?.nombreCompleto || 'Sin profesional',
                            prestacion: registro.tipoPrestacion?.term || registro.tipoPrestacion || 'Sin prestación'
                        });
                    }
                });
            });
            filas.sort((a, b) => moment(b.fecha).valueOf() - moment(a.fecha).valueOf());
            this.listadoCompleto = filas;
            this.hayDatosRango = filas.length > 0;
            if (filas.length) {
                this.hayDatosSigno = true;
            }
            this.cargandoListado = false;
            this.cargarMasListado();
        });
    }

    private cargarMasListado() {
        const cantidad = Math.min(this.listadoCompleto.length, this.listado.length + this.pageSize);
        this.listado = this.listadoCompleto.slice(0, cantidad);
        this.scrollEnd = this.listado.length >= this.listadoCompleto.length;
    }

    private cargarRegistro(signo, elementoRUP?: IElementoRUP) {
        this.elemento = elementoRUP || this.elementosRUPService.buscarElemento(signo.concepto, false);
        this.registro = null;
        this.cargandoRegistro = true;
        if (!this.elemento) {
            this.cargandoRegistro = false;
            return;
        }
        this.prestacionesService.getRegistrosHuds(this.paciente.id, '<<' + signo.concepto.conceptId).subscribe({
            next: prestaciones => {
                if (prestaciones.length) {
                    this.registro = prestaciones[prestaciones.length - 1].registro;
                }
                this.cargandoRegistro = false;
            },
            error: () => {
                this.cargandoRegistro = false;
            }
        });
    }

    private cargarVacunas() {
        if (this.vacunasCargadas || this.cargandoVacunas) {
            return;
        }
        this.cargandoVacunas = true;
        this.servicioVacunas.get(this.paciente.id).subscribe({
            next: resultado => {
                this.vacunas = resultado || [];
                this.vacunasCargadas = true;
                this.cargandoVacunas = false;
            },
            error: () => {
                this.cargandoVacunas = false;
            }
        });
    }

    private cargarVisitas() {
        if (this.visitasCargadas || this.cargandoVisitas) {
            return;
        }
        this.cargandoVisitas = true;
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
            this.cargandoVisitas = false;
        }, () => {
            this.cargandoVisitas = false;
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
