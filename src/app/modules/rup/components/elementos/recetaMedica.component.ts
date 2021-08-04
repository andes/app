import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { forkJoin } from 'rxjs';
import { Unsubscribe } from '@andes/shared';
@Component({
    selector: 'rup-recetaMedica',
    templateUrl: 'recetaMedica.html'
})
@RupElement('RecetaMedicaComponent')
export class RecetaMedicaComponent extends RUPComponent implements OnInit {
    public medicamento: any = {
        generico: null,
        presentacion: null,
        unidades: null,
        cantidad: null,
        diagnostico: '',
        tipoReceta: 'simple',
        tratamientoProlongado: false,
        dosisDiaria: {
            cantidad: null,
            dias: null
        }
    };
    public unidades = [];
    public genericos = [];
    public opcionesTipoReceta = [
        { id: 'simple', label: 'Simple' },
        { id: 'duplicado', label: 'Duplicado' },
        { id: 'triplicado', label: 'Triplicado' }
    ];
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.medicamentos) {
            this.registro.valor.medicamentos = [];
        }
    }

    @Unsubscribe()
    loadMedicamentoGenerico(event) {
        const input = event.query;
        if (input && input.length > 2) {
            let query: any = {
                expression: '<763158003:732943007=*,[0..0] 774159003=*, 763032000=*',
                search: input
            };
            this.snomedService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadPresentaciones() {
        this.medicamento.unidades = null;
        this.medicamento.presentacion = null;
        this.medicamento.cantidad = null;
        this.unidades = [];
        if (this.medicamento.generico) {
            let queryPresentacion: any = {
                expression: `${this.medicamento.generico.conceptId}.763032000`,
                search: ''
            };
            let queryUnidades: any = {
                expression: `(^331101000221109: 774160008 =<${this.medicamento.generico.conceptId}).774161007`,
                search: ''
            };
            forkJoin(
                [this.snomedService.get(queryPresentacion),
                 this.snomedService.get(queryUnidades)]
            ).subscribe(([resultado, presentaciones]) => {
                this.medicamento.presentacion = resultado[0];
                this.unidades = presentaciones.map(elto => {
                    return { id: elto.term, valor: elto.term };
                });
            });
        }
    }

    agregarMedicamento(form) {
        if (form.formValid) {
            if (this.registro.valor.medicamentos.length < this.params.limiteMedicamentos) {
                if (this.medicamento.unidades.valor) {
                    this.medicamento.unidades = Number(this.medicamento.unidades.valor);
                }
                this.registro.valor.medicamentos.push(this.medicamento);
                this.unidades = [];
                this.medicamento = {
                    generico: null,
                    presentacion: null,
                    unidades: null,
                    cantidad: null,
                    diagnostico: '',
                    tipoReceta: 'simple',
                    tratamientoProlongado: false,
                    dosisDiaria: {
                        cantidad: null,
                        dias: null
                    }
                };
            } else {
                this.plex.toast('warning', `No se permite cargar más de ${this.params.limiteMedicamentos} medicamentos.`);
            }
        }
    }

    borrarMedicamento(medicamento) {
        this.plex.confirm('¿Está seguro que desea eliminar el medicamento de la receta?').then((resultado) => {
            if (resultado) {
                let index = this.registro.valor.medicamentos.indexOf(medicamento);
                this.registro.valor.medicamentos.splice(index, 1);
            }
        });
    }
}
