import { Unsubscribe } from '@andes/shared';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { RupElement } from '.';
import { RUPComponent } from '../core/rup.component';
@Component({
    selector: 'rup-recetaMedica',
    templateUrl: 'recetaMedica.html',
    styleUrls: ['recetaMedica.scss'],
})


@RupElement('RecetaMedicaComponent')
export class RecetaMedicaComponent extends RUPComponent implements OnInit {
    @ViewChild('formMedicamento') formMedicamento: NgForm;
    intervalos$: Observable<any>;
    public medicamento: any = {
        generico: null,
        presentacion: null,
        cantidad: null,
        cantEnvases: null,
        diagnostico: null,
        tipoReceta: null,
        tratamientoProlongado: false,
        tiempoTratamiento: null,
        dosisDiaria: {
            dosis: null,
            frecuencia: null,
            dias: null,
            notaMedica: null
        }
    };
    public horas = [];
    public collapse = false;
    public diagnosticos = [];
    public unidades = [];
    public genericos = [];
    public registros = [];
    public comprimidosEditados = false;
    public opcionesTipoReceta = [
        { id: 'duplicado', label: 'Duplicado' },
        { id: 'triplicado', label: 'Triplicado' }
    ];
    public tiemposTratamiento = [
        { id: '3meses', nombre: '3 meses' },
        { id: '6meses', nombre: '6 meses' }
    ];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.medicamentos) {
            this.registro.valor.medicamentos = [];
        }
        this.registros = this.prestacion.ejecucion.registros.filter(reg => reg.id !== this.registro.id).map(reg => reg.concepto);
        this.intervalos$ = this.constantesService.search({ source: 'plan-indicaciones:frecuencia' });

        this.ejecucionService?.hasActualizacion().subscribe(async (estado) => {
            this.loadRegistros();
        });
    }

    @Unsubscribe()
    loadMedicamentoGenerico(event) {
        this.comprimidosEditados = false;
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

    loadRegistros() {
        this.registros = this.prestacion.ejecucion.registros
            .filter(reg => reg.id !== this.registro.id)
            .map(reg => reg.concepto);
    }

    editarComprimidos() {
        if (!this.comprimidosEditados) {
            this.plex.confirm('La cantidad recetada no se encuentra en ninguna presentación comercial ¿Desea continuar?', 'Atención').then(confirmacion => {
                if (confirmacion) {
                    this.medicamento.cantidad = 0;
                    this.comprimidosEditados = true;
                }
            });
        } else {
            this.comprimidosEditados = false;
        }
    }

    loadPresentaciones() {
        this.medicamento.cantidad = null;
        this.medicamento.presentacion = null;
        this.medicamento.cantEnvases = null;
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
                [
                    this.snomedService.get(queryPresentacion),
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
            if (this.medicamento.cantidad?.valor) {
                this.medicamento.cantidad = Number(this.medicamento.cantidad.valor);
            }
            this.registro.valor.medicamentos.push(this.medicamento);
            this.unidades = [];
            this.medicamento = {
                generico: null,
                presentacion: null,
                cantidad: null,
                cantEnvases: null,
                diagnostico: null,
                tipoReceta: null,
                tratamientoProlongado: false,
                tiempoTratamiento: null,
                dosisDiaria: {
                    frecuencia: null,
                    dias: null,
                    notaMedica: null
                }
            };
            this.formMedicamento.reset();
            this.formMedicamento.form.markAsPristine();
            this.formMedicamento.form.markAsUntouched();

        }
    }

    borrarMedicamento(medicamento) {
        this.plex.confirm('¿Está seguro que desea eliminar el medicamento de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.medicamentos.indexOf(medicamento);
                this.registro.valor.medicamentos.splice(index, 1);
            }
        });
    }

    colapsar() {
        this.collapse = !this.collapse;
    }

    truncateDiagnostico(nombre: string): string {
        if (nombre.length > 20) {
            return nombre.substring(0, 20) + '...';
        }
        return nombre;
    }
}
