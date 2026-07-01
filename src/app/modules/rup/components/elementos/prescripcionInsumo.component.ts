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
        cantidad: null,
        tratamientoProlongado: false,
        tiempoTratamiento: null
    };
    public collapse = false;
    public unidades = [];
    public genericos = [];
    public registros = [];
    public loading = false;
    public verificandoDuplicado = false;
    public diagnosticos = [];
    public recetasConFiltros = [];
    private eclInsumos;
    public mostrarEspecificacion = false;
    public tiemposTratamiento = [
        { id: '3', nombre: '3 meses' },
        { id: '6', nombre: '6 meses' }
    ];


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.insumos) {
            this.registro.valor.insumos = [];
        }
        const conceptosPrescripcion = ['16076005', '33633005', '313047003', '1217195001', '1217196000'];
        this.registros = this.prestacion.ejecucion.registros
            .filter(reg => reg.id !== this.registro.id && !conceptosPrescripcion.includes(reg.concepto.conceptId))
            .map(reg => reg.concepto);
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
        const conceptosPrescripcion = ['16076005', '33633005', '313047003', '1217195001', '1217196000'];
        this.registros = [
            ...this.prestacion.ejecucion.registros
                .filter(reg => reg.id !== this.registro.id && !conceptosPrescripcion.includes(reg.concepto.conceptId) && (reg.concepto.semanticTag === 'procedimiento'
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

    preAgregarInsumo(form) {
        if (form.formValid && !this.verificandoDuplicado) {
            this.verificandoDuplicado = true;
            this.checkDuplicado();
        }
    }

    checkDuplicado() {
        const estadoDispensa = ['sin-dispensa', 'dispensa-parcial'].toString();
        const options = { pacienteId: this.paciente.id, estadoDispensa };
        const insumoAgregando = JSON.parse(JSON.stringify(this.insumo));

        this.recetasService.getRecetasInsumos(options).subscribe((data) => {
            this.verificandoDuplicado = false;

            const duplicado = data.find(receta =>
                insumoAgregando.generico.nombre === receta.insumo?.nombre &&
                (receta.estadoActual.tipo === 'vigente' || receta.estadoActual.tipo === 'pendiente') &&
                (receta.estadoDispensaActual.tipo === 'sin-dispensa' || receta.estadoDispensaActual.tipo === 'dispensa-parcial')
            );

            const cargadoActual = this.registro.valor.insumos.find(insumoCargado =>
                insumoAgregando.generico.nombre === insumoCargado.generico.nombre
            );

            if (!duplicado && !cargadoActual) {
                return this.agregarInsumo();
            } else {
                if (duplicado) {
                    const fechaRegistro = new Date(duplicado.fechaRegistro).toLocaleString();
                    this.plex.info('danger', `El insumo "<b>${duplicado.insumo.nombre}</b>" se encuentra vigente en otra receta.<br><small>Fecha de registro: ${fechaRegistro}</small>`);
                } else {
                    this.plex.info('danger', `El insumo "<b>${insumoAgregando.generico.nombre}</b>" se encuentra cargado en la receta actual.`);
                }
            }
        }, () => {
            this.verificandoDuplicado = false;
        });
    }

    agregarInsumo() {
        this.registro.valor.insumos.push(this.insumo);
        this.unidades = [];
        this.insumo = {
            diagnostico: null,
            generico: null,
            cantidad: null,
            tratamientoProlongado: false,
            tiempoTratamiento: null
        };
        this.formInsumo.reset();
        this.formInsumo.form.markAsPristine();
        this.formInsumo.form.markAsUntouched();
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
