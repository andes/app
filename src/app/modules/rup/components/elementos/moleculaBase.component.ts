import moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

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
        this.createRules();
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
