import { Component, Output, Input, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { forkJoin } from 'rxjs';
import { getRegistros, populateRelaciones, unPopulateRelaciones } from '../../operators/populate-relaciones';
import { Unsubscribe } from '@andes/shared';
import { NgForm } from '@angular/forms';
@Component({
    selector: 'rup-recetaMedica',
    templateUrl: 'recetaMedica.html',
    styleUrls: ['recetaMedica.scss'],
})


@RupElement('RecetaMedicaComponent')
export class RecetaMedicaComponent extends RUPComponent implements OnInit {

    @ViewChild('formMedicamento') formMedicamento: NgForm;

    public medicamento: any = {
        generico: null,
        presentacion: null,
        unidades: null,
        cantidad: null,
        diagnostico: '',
        tipoReceta: null,
        tratamientoProlongado: false,
        tiempoTratamiento: null,
        dosisDiaria: {
            cantidad: null,
            dias: null,
            notaMedica: null
        }
    };
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
        this.registros = this.prestacion.ejecucion.registros.filter(reg => {
            reg.nombre !== 'receta';
        }
        ).map(reg => { if (reg.nombre !== 'receta') { return { id: reg.id, nombre: reg.nombre, elementoRUP: reg.elementoRUP }; } });


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
            .filter(reg => reg.nombre !== 'receta')
            .map(reg => {
                return {
                    id: reg.id,
                    nombre: reg.nombre,
                    elementoRUP: reg.elementoRUP
                };
            });

    };
    editarComprimidos() {
        if (!this.comprimidosEditados) {
            this.plex.confirm('La cantidad recetada no se encuentra en ninguna presentación comercial ¿Desea continuar?', 'Atención').then(confirmacion => {
                if (confirmacion) {
                    this.medicamento.unidades = 0;
                    this.comprimidosEditados = true;
                }
            });
        } else {
            this.comprimidosEditados = false;
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
            if (this.registro.valor.medicamentos.length < this.params.limiteMedicamentos) {
                if (this.medicamento.unidades?.valor) {
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
                    tipoReceta: null,
                    tratamientoProlongado: false,
                    tiempoTratamiento: null,
                    dosisDiaria: {
                        cantidad: null,
                        dias: null,
                        notaMedica: null
                    }
                };
                this.formMedicamento.reset();
                this.formMedicamento.form.markAsPristine();
                this.formMedicamento.form.markAsUntouched();
            } else {
                this.plex.toast('warning', `No se permite cargar más de ${this.params.limiteMedicamentos} medicamentos.`);
            }
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

}
