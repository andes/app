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
    viasSnomed = '764295003 OR 761829007 OR 738987007 OR 738986003 OR 738983006 OR 738956005 OR 738952007 OR 738948007 OR 255560000 OR 255559005 OR 421606006';
    formasFarmaceuticasSnomed = `732997007 OR 732994000 OR 732987003 OR 732986007 OR 732981002 OR 732978007 OR 732937005 OR 732936001 OR 
    739009002 OR 739006009 OR 738998008 OR 385099005 OR 739005008`;
    frecuencias$: Observable<any>;
    afterInit = false;
    showModal = false;
    backUpFrecuencias = [];
    fechaMin;
    fechaMax;

    public eclMedicamentos;

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

    addSustancia() {
        this.registro.valor.sustancias.push({
            ingrediente: null,
            denominador: null,
            numerador: null,
            cantidad: null
        });
    }

    deleteSustancia() {
        if (this.registro.valor.sustancias.length > 1) {
            this.registro.valor.sustancias.pop();
        }
    }

    valuesChange() {
        const nombre = this.registro.valor.sustancias.map(item => {
            return `${item.ingrediente?.term || ''}`;
        }).join(' ');
        this.registro.valor.nombre = nombre;
    }

    onChangeUnicaVez(event) {
        const frecuencias = this.registro.valor.frecuencias;
        if (event.value) {
            this.backUpFrecuencias = frecuencias.slice(0, frecuencias.length);
            this.registro.valor.frecuencias = [{
                horario: frecuencias[0].horario,
                velocidad: frecuencias[0].velocidad
            }];
        } else {
            delete this.registro.valor.motivoUnicaVez;
            if (this.backUpFrecuencias.length) {
                this.registro.valor.frecuencias = this.backUpFrecuencias;
            }
        }
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
