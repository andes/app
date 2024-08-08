import { Component, OnInit } from '@angular/core';
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
    unidadesSnomed = '767525000 OR 258997004 OR 258684004 OR 258682000 OR 258685003 OR 258773002 OR 258989006 OR 439139003 OR 404218003';
    viasSnomed = '764295003 OR 761829007 OR 738987007 OR 738986003 OR 738983006 OR 738956005 OR 738952007 OR 738948007 OR 255560000 OR 255559005 OR 421606006';
    formasFarmaceuticasSnomed = `732997007 OR 732994000 OR 732987003 OR 732986007 OR 732981002 OR 732978007 OR 732937005 OR 732936001 OR 
    739009002 OR 739006009 OR 738998008 OR 385099005 OR 739005008`;
    public medicamento: any = {
        generico: null,
        presentacion: null,
        unidades: null,
        cantidad: null,
        diagnostico: '',
        tratamientoProlongado: false,
        dosisDiaria: {
            cantidad: null,
            dias: null
        }
    };
    public unidades = [];
    public genericos = [];

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
            const query: any = {
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
            const queryPresentacion: any = {
                expression: `${this.medicamento.generico.conceptId}.763032000`,
                search: ''
            };
            const queryUnidades: any = {
                expression: `(^331101000221109: 774160008 =<${this.medicamento.generico.conceptId}).774161007`,
                search: ''
            };
            forkJoin(
                [this.snomedService.get(queryPresentacion)
                    , this.snomedService.get(queryUnidades)]
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
            if (this.medicamento.unidades?.valor) {
                this.medicamento.unidades = Number(this.medicamento.unidades.valor);
            }
            this.registro.valor.medicamentos.push(this.medicamento);
            this.plex.toast('success', 'Agregación exitosa');

            this.unidades = [];
            this.medicamento = {
                generico: null,
                presentacion: null,
                unidad: null,
                unidades: null,
                cantidad: null,
                diagnostico: '',
                tratamientoProlongado: false,
                via: null,
                dosisDiaria: {
                    cantidad: null,
                    dias: null
                }
            };

        }
    }

    borrarMedicamento(medicamento) {
        this.plex.confirm('¿Está seguro que desea eliminar el medicamento de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.medicamentos.indexOf(medicamento);
                this.registro.valor.medicamentos.splice(index, 1);
                this.plex.toast('success', 'Eliminación exitosa');

            }
        });
    }
}
