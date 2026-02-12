import { Unsubscribe } from '@andes/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RupElement } from '.';
import { RUPComponent } from '../core/rup.component';
@Component({
    selector: 'rup-prescripcion-insumo',
    templateUrl: 'prescripcionInsumo.html',
    styleUrls: ['recetaMedica.scss']
})

@RupElement('PrescripcionInsumoComponent')

export class PrescripcionInsumoComponent extends RUPComponent implements OnInit {
    @ViewChild('formInsumo') formInsumo: NgForm;

    public insumo: any = {
        diagnostico: null,
        generico: null,
        cantidad: null
    };
    public collapse = false;
    public unidades = [];
    public genericos = [];
    public registros = [];
    public loading = false;
    public diagnosticos = [];
    public recetasConFiltros = [];
    private eclInsumos;
    public mostrarEspecificacion = false;


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.insumos) {
            this.registro.valor.insumos = [];
        }
        this.registros = this.prestacion.ejecucion.registros.filter(reg => reg.id !== this.registro.id).map(reg => reg.concepto);
        this.buscarDiagnosticosConTrastornos();

        this.ejecucionService?.hasActualizacion().subscribe(async (estado) => {
            this.loadRegistros();
        });

        this.eclqueriesServicies.search({ key: '^receta' }).subscribe(query => {
            this.eclInsumos = query.filter(q => q.key === 'receta:dispositivos');
        });
    }

    @Unsubscribe()
    loadInsumo(event) {
        const input = event.query;

        if (input && input.length > 2) {
            const query = {
                'nombre': '^' + input,
                'tipo': this.params.type || ''
            };

            this.insumosService.getInsumos(query).subscribe(
                event.callback);

        } else {
            event.callback([]);
        }
    }

    requiereEspecificacion() {
        if (this.insumo?.generico?.requiereEspecificacion) {
            this.mostrarEspecificacion = true;
        } else {
            this.mostrarEspecificacion = false;
        }

    }

    loadRegistros() {
        this.registros = [
            ...this.prestacion.ejecucion.registros
                .filter(reg => reg.id !== this.registro.id && (reg.concepto.semanticTag === 'procedimiento'
                    || reg.concepto.semanticTag === 'hallazgo' || reg.concepto.semanticTag === 'trastorno'))
                .map(reg => reg.concepto),
            ...this.recetasConFiltros
        ];
    }

    buscarDiagnosticosConTrastornos() {
        this.recetaService.buscarDiagnosticosConTrastornos(this.paciente).subscribe(diagnosticos => {
            this.recetasConFiltros = diagnosticos;
        });
    }

    agregarInsumo() {
        const cargadoActual = this.registro.valor.insumos.find(insumoCargado =>
            this.insumo.generico.nombre === insumoCargado.generico.nombre
        );

        if (!cargadoActual) {
            this.registro.valor.insumos.push(this.insumo);
            this.unidades = [];
            this.insumo = {
                diagnostico: null,
                generico: null,
                cantidad: null
            };
            this.formInsumo.reset();
            this.formInsumo.form.markAsPristine();
            this.formInsumo.form.markAsUntouched();
        } else {
            this.plex.info('danger', `El insumo "<b>${this.insumo.generico.nombre}</b>" se encuentra cargado en la receta actual.`);
        }

    }

    borrar(insumo) {
        this.plex.confirm('¿Está seguro que desea eliminar este insumo de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.insumos.indexOf(insumo);
                this.registro.valor.insumos.splice(index, 1);
            }
        });
    }
}
