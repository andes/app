import { Unsubscribe } from '@andes/shared';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';

@Component({
    selector: 'rup-prescripcion-medicamentos-internacion',
    templateUrl: 'prescripcion-medicamento-internacion.component.html',
    styleUrls: ['prescripcion-medicamento-internacion.scss']
})
@RupElement('SolicitudPrescripcionMedicamentoInternacionComponent')
export class SolicitudPrescripcionMedicamentoInternacionComponent extends RUPComponent implements OnInit, AfterViewInit {

    unidadesSnomed = '767525000 OR 258997004 OR 258684004 OR 258682000 OR 258685003 OR 258773002 OR 258989006 OR 439139003 OR 404218003';
    formasFarmaceuticasSnomed = `732997007 OR 732994000 OR 732987003 OR 732986007 OR 732981002 OR 732978007 OR 732937005 OR 732936001 OR 
    739009002 OR 739006009 OR 738998008 OR 385099005 OR 739005008`;
    frecuencias$: Observable<any>;
    afterInit = false;
    showModal = false;
    backUpFrecuencias = [];
    fechaMin;
    fechaMax;

    public eclMedicamentos;
    vias$: Observable<any[]>;

    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    ngOnInit() {
        this.eclqueriesServicies.search({ key: '^receta' }).subscribe(query => {
            this.eclMedicamentos = query.find(q => q.key === 'receta:genericos');
        });
        this.fechaMin = moment().startOf('day').toDate();
        this.fechaMax = moment().endOf('day').toDate();
        this.frecuencias$ = this.constantesService.search({ source: 'plan-indicaciones:frecuencia' });
        this.vias$ = this.constantesService.search({ source: 'plan-indicaciones:via' });

        if (!this.registro.valor) {
            this.registro.valor = {
                nombre: '',
                sustancias: [{
                    ingrediente: null,
                    denominador: null,
                    numerador: null,
                    cantidad: null
                }],
                frecuencias: [{
                    frecuencia: null,
                    horario: null,
                    cantidad: null
                }]
            };
        }
    }


    valuesChange() {
        const nombre = this.registro.valor.sustancias.map(item => {
            return `${item.ingrediente?.term || ''}`;
        }).join(' ');
        this.registro.valor.nombre = nombre;
    }

    onChangeUnicaVez(event: any) {
        const value = typeof event === 'object' ? event.value : event;
        this.registro.valor.unicaVez = value;

        if (value) {
            this.registro.valor.sos = false;
            this.backUpFrecuencias = this.registro.valor.frecuencias.slice(0);
            this.registro.valor.frecuencias = [{
                horario: this.backUpFrecuencias[0]?.horario || null,
                velocidad: this.backUpFrecuencias[0]?.velocidad || null
            }];
        } else if (this.backUpFrecuencias.length) {
            this.registro.valor.frecuencias = this.backUpFrecuencias;
        }

        this.emitChange();
    }

    @Unsubscribe()
    loadMedicamentoGenerico(event) {
        const input = event.query;
        if (input && input.length > 3) {
            const query: any = {
                expression: this.eclMedicamentos.valor,
                search: input
            };
            this.snomedService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    @Unsubscribe()
    loadConceptos(event) {
        if (!event) { return; }
        if (event.query && event.query.length > 2) {
            return this.getData(event.query).subscribe((data) => {
                event.callback(data);
            });
        } else {
            if (this.registro.valor && this.registro.valor.length) {
                event.callback(this.registro.valor);
            } else {
                event.callback([]);
            }
        }
    }

    getData(input: string) {
        return this.snomedService.get({
            search: input,
            semanticTag: 'fármaco de uso clínico',
        });
    }

    isEmpty() {
        const value = this.registro.valor;
        return !value.indicaciones;
    }

    onSelectMedicamentos(medicamento) {
        this.registro.valor.medicamento = medicamento;
        this.emitChange2();
    }
    onChangeSos(event: any) {
        const value = typeof event === 'object' ? event.value : event;
        this.registro.valor.sos = value;

        if (value) {
            this.registro.valor.unicaVez = false;
            this.registro.valor.frecuencias = [];
        } else {
            if (!this.registro.valor.frecuencias?.length) {
                this.registro.valor.frecuencias = [{
                    frecuencia: null,
                    horario: null,
                    cantidad: null
                }];
            }
        }
        this.emitChange();
    }
    emitChange2() {
        this.emitChange();
        if (this.registro.valor.medicamento?.conceptId) {
            const ctid = this.registro.valor.medicamento.conceptId;
            this.snomedService.getQuery({
                expression: `${ctid}.411116001.736474004`
            }).subscribe((cts: any[]) => {
                if (cts.length) {
                    this.registro.valor.via = cts[0];
                }
            });
        }
    }
}
