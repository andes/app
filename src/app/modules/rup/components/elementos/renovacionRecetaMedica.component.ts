import { Component, Output, Input, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
@Component({
    selector: 'rup-renovacionRecetaMedica',
    templateUrl: 'renovacionRecetaMedica.html'
})


@RupElement('RenovacionRecetaMedicaComponent')
export class RenovacionRecetaMedicaComponent extends RUPComponent implements OnInit {

    @ViewChild('formMedicamento') formMedicamento: NgForm;
    intervalos$: Observable<any>;


    public recetasFiltradas = [];
    public medicamentoCargados = [];
    public medicamentoSeleccionado: any = {
        id: null,
        nombre: null
    };

    ngOnInit() {

        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.medicamentos) {
            this.registro.valor.medicamentos = [];
        }
        this.intervalos$ = this.constantesService.search({ source: 'plan-indicaciones:frecuencia' });
        this.buscarHistorialReceta();
    }

    buscarHistorialReceta() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {

            const fechaLimite = moment().subtract(6, 'months');
            this.recetasFiltradas = arrayPrestaciones
                .filter(prestacion => {
                    const fechaCreacion = moment(prestacion.createdAt);
                    return fechaCreacion.isAfter(fechaLimite) &&
                        prestacion.ejecucion?.registros?.some(registro =>
                            registro.concepto?.conceptId === '16076005'
                        );
                })
                .map(prestacion =>
                    (prestacion.ejecucion?.registros || []).map(registro => ({
                        medicamentos: registro.valor?.medicamentos || [],
                        fecha: moment(prestacion.createdAt)
                    }))
                )
                .reduce((acumulador, registros) => acumulador.concat(registros), [])
                .reduce((acumulador, item) => acumulador.concat(
                    item.medicamentos.map(med => ({ ...med, fecha: item.fecha }))
                ), []);

            // Mapa para almacenar el medicamento con la fecha más reciente
            const medicamentosUnicos = new Map<string, any>();

            this.recetasFiltradas.forEach(medicamento => {
                const id = medicamento.generico?.conceptId;
                if (id) {
                    if (!medicamentosUnicos.has(id) || medicamentosUnicos.get(id).fecha.isBefore(medicamento.fecha)) {
                        medicamentosUnicos.set(id, medicamento);
                    }
                }
            });
            this.medicamentoCargados = Array.from(medicamentosUnicos.values()).map(medicamento => ({
                id: medicamento.generico?.conceptId,
                nombre: medicamento.generico?.term || 'Desconocido'
            }));

        });
    }

    agregarMedicamento() {
        const index = this.medicamentoCargados.findIndex(med =>
            med.id === this.medicamentoSeleccionado.id
        );
        if (index !== -1) {
            const medSeleccionado = this.recetasFiltradas[index];
            this.medicamentoCargados.splice(index, 1);
            this.recetasFiltradas.splice(index, 1);
            this.registro.valor.medicamentos.push(medSeleccionado);
            this.medicamentoCargados = [...this.medicamentoCargados];

            this.medicamentoSeleccionado = {
                id: null,
                nombre: null
            };
        }
    }

    borrarMedicamento(medicamento) {
        this.plex.confirm('¿Está seguro que desea eliminar el medicamento de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.medicamentos.indexOf(medicamento);

                if (index !== -1) {
                    const medicamentoEliminar = this.registro.valor.medicamentos[index];
                    this.registro.valor.medicamentos.splice(index, 1);
                    this.recetasFiltradas.push(medicamentoEliminar);
                    this.medicamentoCargados.push({
                        id: medicamentoEliminar.generico.conceptId,
                        nombre: medicamentoEliminar.generico.term
                    });

                    this.medicamentoCargados = [...this.medicamentoCargados];
                }
            }
        });
    }

}
