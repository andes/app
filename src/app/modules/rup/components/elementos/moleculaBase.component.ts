import { Component, OnInit, HostListener } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: 'moleculaBase.html'
})
@RupElement('MoleculaBaseComponent')
export class MoleculaBaseComponent extends RUPComponent implements OnInit {
    public contentLoaded = false;
    public ultimaConsulta;
    public validacion = false;
    public estados = [
        { id: 'resuelto', nombre: 'Resuelto' },
        { id: 'activo', nombre: 'Activo' }
    ];
    public consultaTrastornoOriginal: any;
    public evoluciones;

    /**
     * Registros agregados dinámicamente dentro de la molécula (los que no son átomos de "requeridos").
     */
    get registrosDinamicos() {
        const idsRequeridos = (this.elementoRUP.requeridos || []).map(r => r.concepto.conceptId);
        return (this.registro.registros || []).filter(r => !idsRequeridos.includes(r.concepto.conceptId));
    }

    ngOnInit() {
        if (this.registro.concepto.semanticTag === 'trastorno') {
            if (!this.registro.valor) {
                this.registro.valor = { estado: 'activo' };
            }
            const regFechaInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '298059007');
            const regHhoraInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '405795006');
            if (regFechaInicio?.valor && regHhoraInicio?.valor) {
                const inicio = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                this.registro.valor.fechaInicio = inicio;
            }
            // Si llega un idRegistroOrigen es porque se trata de evolucionar un problema que ya existe en la HUDS
            // tenemos que mostrar las evoluciones anteriores
            if (this.registro.valor.idRegistroOrigen) {
                this.getRegistrosAnteriores(this.registro.concepto);
            }
        }

        if (this.params && this.params.hasSections) {
            this.registro.hasSections = true;
        }
        this.validacion = !this.ejecucionService;

        const buscarAnterior = this.params && this.params.buscarAnterior;
        if (!this.validacion && !this.soloValores && buscarAnterior) {
            this.prestacionesService.getRegistrosHuds(this.paciente.id, this.registro.concepto.conceptId).subscribe(consulta => {
                consulta.sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();

                    return dateA > dateB ? -1 : 1;
                });

                if (consulta.length > 0) {
                    const fechaPrestacion = this.prestacion.updatedAt || this.prestacion.createdAt;
                    const esFutura = consulta[0].registro.updatedAt.getTime() > fechaPrestacion.getTime();

                    if (!esFutura) {

                        this.ultimaConsulta = consulta[0].registro;
                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                    }
                }
                this.contentLoaded = true;
            });
        } else {
            this.contentLoaded = true;
        }
        if (this.ejecucionService) {
            this.ejecucionService.conceptosStream().pipe(
                filter(r => r.seccion && r.seccion.conceptId === this.registro.concepto.conceptId),
                takeUntil(this.onDestroy$)
            ).subscribe((registro) => {
                this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, null);
            });
        }

        this.createRules();
    }

    @HostListener('click')
    activarSeccion() {
        if (this.ejecucionService && !this.soloValores) {
            const seccion = this.ejecucionService.getSeccionValue();
            if (seccion?.conceptId === this.registro.concepto.conceptId) {
                this.ejecucionService.clearSeccion();
            } else {
                this.ejecucionService.setSeccion(this.registro.concepto);
            }
        }
    }

    /**
     * Desactiva la molécula si es la sección activa.
     */
    desactivarSeccion() {
        if (this.ejecucionService) {
            const seccion = this.ejecucionService.getSeccionValue();
            if (seccion?.conceptId === this.registro.concepto.conceptId) {
                this.ejecucionService.clearSeccion();
            }
        }
    }

    onDestroy() {
        this.desactivarSeccion();
    }

    cargarNuevoRegistro(snomedConcept, esSolicitud = false, valor = null, relaciones = null) {
        const elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        const nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept, this.prestacion);
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;
        if (relaciones) {
            nuevoRegistro.relacionadoCon = relaciones;
        }
        if (snomedConcept.semanticTag === 'procedimiento' || snomedConcept.semanticTag === 'elemento de registro' || snomedConcept.semanticTag === 'régimen/tratamiento' || snomedConcept.semanticTag === 'situación') {
            this.plantillasService.get(snomedConcept.conceptId, esSolicitud).subscribe(() => { });
        }
        this.registro.registros.push(nuevoRegistro);
    }

    onChange(value) {
        if (this.registro.concepto.semanticTag === 'trastorno') {
            const regFechaInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '298059007');
            const regHhoraInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '405795006');
            if (regFechaInicio?.valor && regHhoraInicio?.valor && (value.concepto.conceptId === '298059007' || value.concepto.conceptId === '405795006')) {
                // para mantener el registro 'horaInicio' consistente con la fecha, ya que desde la molecula solo podemos setear la hora
                regHhoraInicio.valor = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                regFechaInicio.valor = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                this.registro.valor.fechaInicio = regHhoraInicio.valor;
            }
        }
    }

    getRegistrosAnteriores(idOrigen) {
        this.prestacionesService.getUnTrastornoPaciente(this.paciente.id, idOrigen).subscribe(trastorno => {
            if (trastorno) {
                this.consultaTrastornoOriginal = trastorno.registros.find(reg => reg.concepto.conceptId === this.registro.concepto.conceptId);
                this.evoluciones = [...trastorno.evoluciones];

                if (this.evoluciones && this.evoluciones.length > 0) {
                    this.registro.valor.estado = this.registro.valor.estado || 'activo';
                    this.registro.valor.fechaInicio = this.consultaTrastornoOriginal.registros.find(reg => reg.concepto.conceptId === '298059007').valor;
                    this.registro.registros.find(reg => reg.concepto.conceptId === '298059007').valor = this.registro.valor.fechaInicio;
                    this.registro.registros.find(reg => reg.concepto.conceptId === '405795006').valor = this.consultaTrastornoOriginal.registros.find(reg => reg.concepto.conceptId === '405795006').valor;
                    this.registro.valor.evolucion = this.registro.registros.find(reg => reg.concepto.conceptId === '229059009').valor;
                }
            }
        });
    }

    createRules() {
        if (this.elementoRUP.rules?.length > 0) {
            const registros = (this.registro.registros || []);
            registros.forEach(item => {
                this.conceptObserverService.observe({ concepto: item.concepto } as any).subscribe(value => {
                    this.addFact(item.concepto.conceptId, value.valor);
                });
            });

            this.onRule('set-value').subscribe(evento => {
                const { params } = evento;
                this.conceptObserverService.notify(params.target, { valor: params.valor } as any);
            });
        }
    }

    formatearEstado() {
        this.registro.valor.estado = ((typeof this.registro.valor.estado === 'string')) ? this.registro.valor.estado : (Object(this.registro.valor.estado).id);
        this.emitChange();
    }
}
