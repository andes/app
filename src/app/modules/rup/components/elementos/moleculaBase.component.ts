import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { threadId } from 'worker_threads';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: '../core/rup.html'
})
@RupElement('MoleculaBaseComponent')
export class MoleculaBaseComponent extends RUPComponent implements OnInit {
    contentLoaded = false;
    ultimaConsulta;
    validacion = false;

    ngOnInit() {
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

}
