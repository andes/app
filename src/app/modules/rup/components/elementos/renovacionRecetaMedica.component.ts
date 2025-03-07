import { Component, OnInit, ViewChild } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
@Component({
    selector: 'rup-renovacionRecetaMedica',
    templateUrl: 'renovacionRecetaMedica.html',
    styleUrls: ['recetaMedica.scss']
})


@RupElement('RenovacionRecetaMedicaComponent')
export class RenovacionRecetaMedicaComponent extends RUPComponent implements OnInit {

    @ViewChild('formMedicamento') formMedicamento: NgForm;
    intervalos$: Observable<any>;


    public recetasFiltradas = [];
    public medicamentoCargados;
    public medicamentoSeleccionado: any = {
        conceptId: null,
        fsn: null,
        semanticTag: null,
        term: null
    };

    public medicamentoEliminado: any = {
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
        this.medicamentoCargados = this.registro.valor.medicamentos;
        this.intervalos$ = this.constantesService.search({ source: 'plan-indicaciones:frecuencia' });
        this.buscarHistorialReceta();
    }

    getMedicamentos() {
        return this.medicamentoCargados; // Genera una nueva referencia del array
    }

    buscarHistorialReceta() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {

            const fechaLimite = moment().subtract(6, 'months');
            this.recetasFiltradas = arrayPrestaciones
                .filter(prestacion => {
                    const fechaCreacion = moment(prestacion.createdAt);
                    return fechaCreacion.isAfter(fechaLimite) &&
                        prestacion.ejecucion?.registros?.some(registro =>
                            registro.concepto?.conceptId === '16076005' ||
                            registro.concepto?.conceptId === '103742009'
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


            const medicamentosUnicos2 = [];
            this.recetasFiltradas = this.recetasFiltradas.filter(medicamento => {
                const id = medicamento.generico?.conceptId;
                if (!id) { return false; }
                const encuentraMedicamento = medicamentosUnicos2.findIndex(med => {
                    return ((med.generico.conceptId === id && med.fecha.isBefore(medicamento.fecha)));
                });

                if (encuentraMedicamento !== -1) {
                    medicamentosUnicos2[encuentraMedicamento] = medicamento;
                    return false;
                } else {
                    medicamentosUnicos2.push(medicamento);
                    return true;
                }

            });
            this.medicamentoCargados = Array.from(medicamentosUnicos2.values()).map(medicamento => ({
                id: medicamento.generico?.conceptId,
                nombre: medicamento.generico?.term
            }));
        });
    }

    agregarMedicamento() {
        const index = this.medicamentoCargados.findIndex(med =>
            med.id === this.medicamentoSeleccionado.id
        );

        if (index !== -1) {
            // console.log(index, ' elim : ', this.medicamentoSeleccionado);
            const medSeleccionado = this.recetasFiltradas[index];
            this.medicamentoEliminado = this.recetasFiltradas[index];
            this.registro.valor.medicamentos.push(medSeleccionado);

            this.medicamentoSeleccionado = {
                id: null,
                nombre: null
            };
            this.plex.toast('success', 'Medicamento agregado exitosamente');
        }
    }

    deshabilitarAgregar() {

        const medicamentoInexistente = this.registro.valor.medicamentos.findIndex(med =>
            med.generico.conceptId === this.medicamentoSeleccionado?.id
        );
        return (this.medicamentoCargados?.length < 1 || !this.medicamentoSeleccionado.id || medicamentoInexistente !== -1);
    }

    borrarMedicamento(medicamento) {
        this.plex.confirm('¿Está seguro que desea eliminar el medicamento de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.medicamentos.indexOf(medicamento);

                if (index !== -1) {
                    this.registro.valor.medicamentos.splice(index, 1);

                    this.medicamentoSeleccionado = {
                        id: null,
                        nombre: null
                    };
                    this.plex.toast('success', 'Medicamento eliminado exitosamente');
                }
            }
        });
    }

}
