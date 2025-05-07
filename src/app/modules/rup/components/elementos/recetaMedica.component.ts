import { Unsubscribe } from '@andes/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
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
        serie: null,
        numero: null,
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
    public recetasConFiltros = [];
    public medicamentoCargados = [];
    public registros = [];
    public ingresoCantidadManual = false;
    public valorCantidadManual = null;
    public loading = false;
    public opcionesTipoReceta = [
        { id: 'duplicado', label: 'Duplicado' },
        { id: 'triplicado', label: 'Triplicado' }
    ];
    public tiemposTratamiento = [
        { id: '3meses', nombre: '3 meses' },
        { id: '6meses', nombre: '6 meses' }
    ];
    public eclMedicamentos;
    public eclPresentaciones;
    public eclMedicamentosComerciales;
    public eclUnidadesFiltro;
    public requiereDosis = false;
    public requiereIntervalo = false;


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.medicamentos) {
            this.registro.valor.medicamentos = [];
        }
        this.registros = this.prestacion.ejecucion.registros.filter(reg => reg.id !== this.registro.id).map(reg => reg.concepto);
        this.intervalos$ = this.constantesService.search({ source: 'plan-indicaciones:frecuencia' });
        this.eclqueriesServicies.search({ key: '^receta' }).subscribe(query => {
            this.eclMedicamentos = query.find(q => q.key === 'receta:genericos');
            this.eclPresentaciones = query.find(q => q.key === 'receta:presentacionescomerciales');
            this.eclMedicamentosComerciales = query.find(q => q.key === 'receta:medicamentoscomercialesporgenerico');
            this.eclUnidadesFiltro = query.find(q => q.key === 'receta:filtroUnidades');
        });
        this.buscarDiagnosticosConTrastornos();

        this.ejecucionService?.hasActualizacion().subscribe(async () => {
            this.loadRegistros();
        });
    }

    @Unsubscribe()
    loadMedicamentoGenerico(event) {
        const input = event.query;
        if (input && input.length > 2 && this.eclMedicamentos) {
            const query: any = {
                expression: this.eclMedicamentos.valor,
                search: input
            };
            this.snomedService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadRegistros() {
        this.registros = [
            ...this.prestacion.ejecucion.registros
                .filter(reg => reg.concepto.conceptId !== this.registro.concepto.conceptId && (reg.concepto.semanticTag === 'procedimiento'
                    || reg.concepto.semanticTag === 'hallazgo' || reg.concepto.semanticTag === 'trastorno'))
                .map(reg => reg.concepto),
            ...this.recetasConFiltros
        ];
    }

    loadPresentaciones() {
        this.deshacerCantidadManual();
        this.loading = true;
        this.medicamento.cantidad = null;
        this.medicamento.presentacion = null;
        this.medicamento.cantEnvases = null;
        if (this.medicamento.generico && this.eclPresentaciones && this.eclMedicamentosComerciales) {
            const queryPresentacion: any = {
                expression: this.eclPresentaciones.valor.replace('#MG#', this.medicamento.generico.conceptId),
                search: ''
            };
            const queryUnidades: any = {
                expression: this.eclMedicamentosComerciales.valor.replace('#MG#', this.medicamento.generico.conceptId),
                type: this.eclUnidadesFiltro.valor
            };

            forkJoin([
                this.snomedService.get(queryPresentacion),
                this.snomedService.getByRelationships(queryUnidades)]
            ).subscribe(([resultado, presentaciones]) => {
                this.medicamento.presentacion = resultado ? resultado[0] : null;
                this.unidades = presentaciones.map(elto => {
                    return { id: elto, valor: elto };
                });
                if (this.unidades.length) {
                    this.unidades.unshift({ id: 'otro', valor: 'Otro' });
                } else {
                    this.ingresoCantidadManual = true;
                }
                this.loading = false;
            });
        } else {
            this.unidades = [];
            this.ingresoCantidadManual = false;
        }
    }

    onChange($event) {
        if ($event?.value?.id === 'otro') {
            this.ingresoCantidadManual = true;
        }
    }

    changeDosisIntervalo() {
        this.requiereDosis = !!this.medicamento?.dosisDiaria?.intervalo;
        this.requiereIntervalo = !!this.medicamento?.dosisDiaria?.dosis;
    }

    deshacerCantidadManual() {
        this.medicamento.cantidad = null;
        this.ingresoCantidadManual = false;
        this.valorCantidadManual = null;
    }

    showModalCantidadManual() {
        if (this.unidades && this.ingresoCantidadManual) {
            this.plex.confirm('La cantidad recetada no se encuentra en ninguna presentación comercial ¿Desea continuar?', 'Atención').then(confirmacion => {
                if (confirmacion) {
                    this.checkDuplicado();
                } else {
                    this.deshacerCantidadManual();
                }
            });
        }
    }

    preAgregarMedicamento(form) {
        if (form.formValid) {
            // si se ingresó una cantidad manualmente y no se seleccionó ninguna presentación comercial
            if (this.unidades.length && this.ingresoCantidadManual) {
                this.showModalCantidadManual();
            } else {
                this.checkDuplicado();
            }
        }
    }
    checkDuplicado() {
        const estadoDispensa = ['sin-dispensa', 'dispensa-parcial'].toString();
        const options = { pacienteId: this.paciente.id, estadoDispensa };
        this.recetasService.getRecetas(options).subscribe((data) => {
            const duplicado = data.find(receta =>
                this.medicamento.generico.conceptId === receta.medicamento.concepto.conceptId &&
                (receta.estadoActual.tipo === 'vigente' || receta.estadoActual.tipo === 'pendiente') &&
                (receta.estadoDispensaActual.tipo === 'sin-dispensa' || receta.estadoDispensaActual.tipo === 'dispensa-parcial')
            );
            const cargadoActual = this.registro.valor.medicamentos.find(medicamentoCargado =>
                this.medicamento.generico.conceptId === medicamentoCargado.generico.conceptId
            );

            if (!duplicado && !cargadoActual) {
                return this.agregarMedicamento();
            } else {
                if (duplicado) {
                    const fechaRegistro = new Date(duplicado.fechaRegistro).toLocaleString();
                    this.plex.info('danger', `El medicamento "<b>${duplicado.medicamento.concepto.term}</b>" se encuentra vigente en otra receta.<br><small>Fecha de registro: ${fechaRegistro}</small>`);
                } else {
                    this.plex.info('danger', `El medicamento "<b>${this.medicamento.generico.term}</b>" se encuentra cargado en la receta actual.`);
                }
            }
        });
    }

    buscarDiagnosticosConTrastornos() {
        const fechaLimite = moment().subtract(6, 'months');
        this.prestacionesService.getByPacienteTrastorno(this.paciente.id).subscribe((trastornos) => {

            trastornos.forEach(trastorno => {
                const fechaCreacion = trastorno.fechaEjecucion ? moment(trastorno.fechaEjecucion) : null;
                const esActivo = trastorno.evoluciones[trastorno.evoluciones.length - 1].estado === 'activo';
                if (fechaCreacion?.isAfter(fechaLimite) && esActivo) {
                    this.recetasConFiltros.push(trastorno.concepto);
                }
            });
        });

    }

    agregarMedicamento() {
        if (this.medicamento.cantidad?.valor && this.medicamento.cantidad?.valor !== 'Otro') {
            this.medicamento.cantidad = Number(this.medicamento.cantidad.valor);
        } else if (this.ingresoCantidadManual && this.valorCantidadManual) {
            this.medicamento.cantidad = this.valorCantidadManual;
        }
        this.registro.valor.medicamentos.push(this.medicamento);
        this.unidades = [];
        this.medicamento = {
            generico: null,
            presentacion: null,
            cantidad: null,
            cantEnvases: null,
            diagnostico: null,
            tipoReceta: { id: 'simple', label: 'Simple' },
            tratamientoProlongado: false,
            tiempoTratamiento: null,
            serie: null,
            numero: null,
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

    public onValidate() {
        return this.registro.valor.medicamentos.length > 0 ? true : false;
    }

    onTipoRecetaChange() {
        if (this.medicamento.tipoReceta === 'triplicado') {
            this.medicamento.tratamientoProlongado = false;
            this.medicamento.tiempoTratamiento = null;
        }
    }
}
