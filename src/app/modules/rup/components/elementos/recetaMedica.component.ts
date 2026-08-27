import { Unsubscribe } from '@andes/shared';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { RupElement } from '.';
import { IObraSocial } from '../../../../interfaces/IObraSocial';
import { RUPComponent } from './../core/rup.component';
@Component({
    selector: 'rup-recetaMedica',
    templateUrl: 'recetaMedica.html',
    styleUrls: ['recetaMedica.scss'],
})


@RupElement('RecetaMedicaComponent')
export class RecetaMedicaComponent extends RUPComponent implements OnInit, OnChanges, OnDestroy {
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
        esMagistral: false,
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
    public esDuplicado = false;
    public esTriplicado = false;
    public tiemposTratamiento = [
        { id: '3', nombre: '3 meses' },
        { id: '6', nombre: '6 meses' }
    ];
    public eclMedicamentos;
    public eclPresentaciones;
    public eclMedicamentosComerciales;
    public eclUnidadesFiltro;

    // Propiedades para manejo de obras sociales
    public financiadoresPaciente: IObraSocial[] = [];
    public datosFinanciadores = [];
    public financiadorSeleccionado;
    public otroFinanciadorSeleccionado;
    public showSelector = false;
    public showListado = false;
    public opcionesFinanciadores: any[] = [];
    public obrasSocialesPaciente: any[] = [];
    public numeroAfiliado = '';
    public patronNumerico = '^[0-9]*$';
    private timeout: any;


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

        // Cargar obras sociales del paciente
        setTimeout(() => {
            this.cargarObrasSocialesPaciente();
        }, 100);

        this.ejecucionService?.hasActualizacion().subscribe(async () => {
            // Preservar el numeroAfiliado antes de recargar registros
            const numeroAfiliadoTemporal = this.numeroAfiliado;
            this.loadRegistros();
            // Restaurar el numeroAfiliado si se perdió
            if (numeroAfiliadoTemporal && !this.numeroAfiliado) {
                this.numeroAfiliado = numeroAfiliadoTemporal;
            }
        });

        if (this.paciente) {
            this.cargarObrasSocialesPaciente();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente && changes.paciente.currentValue) {
            this.cargarObrasSocialesPaciente();
        }
    }

    @Unsubscribe()
    loadMedicamentoGenerico(event) {
        const input = event.query;
        if (input && input.length > 2) {
            if (this.medicamento.esMagistral) {
                this.recetasService.getInsumos({ termino: input, tipo: 'magistral' }).subscribe(insumos => {
                    const mappedInsumos = insumos.map(i => {
                        return {
                            ...i,
                            term: i.nombre,
                            conceptId: i.id
                        };
                    });
                    event.callback(mappedInsumos);
                });
            } else if (this.eclMedicamentos) {
                const query = {
                    expression: this.eclMedicamentos.valor,
                    search: input
                };
                this.snomedService.get(query).subscribe(event.callback);
            } else {
                event.callback([]);
            }
        } else {
            event.callback([]);
        }
    }

    onChangeMagistral() {
        this.medicamento.generico = null;
        this.medicamento.presentacion = null;
        this.unidades = [];
        this.deshacerCantidadManual();
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
        this.medicamento.presentacion = null;
        this.medicamento.cantEnvases = null;

        if (this.medicamento.esMagistral) {
            this.unidades = [];
            this.ingresoCantidadManual = true;
            this.loading = false;
            return;
        }

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
            const esMagistralActual = !!this.medicamento.esMagistral;
            const termNombreActual = esMagistralActual
                ? (this.medicamento.generico?.nombre || this.medicamento.generico?.term)
                : this.medicamento.generico?.term;
            const conceptIdActual = this.medicamento.generico?.conceptId || this.medicamento.generico?.id || this.medicamento.generico?._id;

            const duplicado = data.find(receta => {
                const esVigenteOMismaDispensa =
                    (receta.estadoActual.tipo === 'vigente' || receta.estadoActual.tipo === 'pendiente') &&
                    (receta.estadoDispensaActual.tipo === 'sin-dispensa' || receta.estadoDispensaActual.tipo === 'dispensa-parcial');

                if (!esVigenteOMismaDispensa) {
                    return false;
                }

                if (esMagistralActual) {
                    return !!receta.medicamento?.esMagistral &&
                        (receta.medicamento?.magistral?.nombre === termNombreActual ||
                         receta.medicamento?.magistral?.id === conceptIdActual);
                } else {
                    return !receta.medicamento?.esMagistral &&
                        receta.medicamento?.concepto?.conceptId === conceptIdActual;
                }
            });

            const cargadoActual = this.registro.valor.medicamentos.find(medicamentoCargado => {
                if (esMagistralActual) {
                    const nombreCargado = medicamentoCargado.magistral?.nombre || medicamentoCargado.generico?.nombre || medicamentoCargado.generico?.term;
                    const idCargado = medicamentoCargado.magistral?.id || medicamentoCargado.generico?.conceptId || medicamentoCargado.generico?.id || medicamentoCargado.generico?._id;
                    return medicamentoCargado.esMagistral && (nombreCargado === termNombreActual || idCargado === conceptIdActual);
                } else {
                    return !medicamentoCargado.esMagistral && medicamentoCargado.generico?.conceptId === conceptIdActual;
                }
            });

            if (!duplicado && !cargadoActual) {
                return this.agregarMedicamento();
            } else {
                if (duplicado) {
                    const fechaRegistro = new Date(duplicado.fechaRegistro).toLocaleString();
                    const nombreMed = duplicado.medicamento?.magistral?.nombre || duplicado.medicamento?.nombre || duplicado.medicamento?.concepto?.term;
                    this.plex.info('danger', `El medicamento "<b>${nombreMed}</b>" se encuentra vigente en otra receta.<br><small>Fecha de registro: ${fechaRegistro}</small>`);
                } else {
                    this.plex.info('danger', `El medicamento "<b>${termNombreActual}</b>" se encuentra cargado en la receta actual.`);
                }
            }
        });
    }

    buscarDiagnosticosConTrastornos() {
        this.recetaService.buscarDiagnosticosConTrastornos(this.paciente).subscribe(diagnosticos => {
            this.recetasConFiltros = diagnosticos;
        });
    }

    agregarMedicamento() {
        if (this.medicamento.cantidad?.valor && this.medicamento.cantidad?.valor !== 'Otro') {
            this.medicamento.cantidad = Number(this.medicamento.cantidad.valor);
        } else if (this.ingresoCantidadManual && this.valorCantidadManual) {
            this.medicamento.cantidad = this.valorCantidadManual;
        }

        if (this.medicamento.esMagistral && this.medicamento.generico) {
            this.medicamento.magistral = {
                id: this.medicamento.generico.id || this.medicamento.generico._id || this.medicamento.generico.conceptId,
                nombre: this.medicamento.generico.nombre || this.medicamento.generico.term,
                unidadMedida: this.medicamento.generico.unidadMedida || null,
                codigo: this.medicamento.generico.codigo || []
            };
            this.medicamento.generico = null;
        }

        this.registro.valor.medicamentos.push(this.medicamento);
        this.unidades = [];

        const numeroAfiliadoTemporal = this.numeroAfiliado;

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
            esMagistral: false,
            magistral: null,
            dosisDiaria: {
                frecuencia: null,
                dias: null,
                notaMedica: null
            }
        };

        this.formMedicamento.reset();
        this.formMedicamento.form.markAsPristine();
        this.formMedicamento.form.markAsUntouched();

        if (numeroAfiliadoTemporal) {
            this.numeroAfiliado = numeroAfiliadoTemporal;
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

    public onValidate() {
        if (this.prestacion?.paciente?.obraSocial) {
            this.prestacion.paciente.obraSocial.numeroAfiliado = this.numeroAfiliado || '';
        }
        return this.registro.valor.medicamentos && this.registro.valor.medicamentos.length > 0;
    }

    onTipoRecetaChange(tipo: string) {
        this.medicamento.tipoReceta = this.esDuplicado || this.esTriplicado ? tipo : 'simple';
        if (tipo === 'duplicado') {
            this.esTriplicado = false;
        }
        if (tipo === 'triplicado') {
            this.esDuplicado = false;
            this.medicamento.tratamientoProlongado = false;
            this.medicamento.tiempoTratamiento = null;
        }
    }

    cargarObrasSocialesPaciente() {
        this.financiadoresPaciente = [];

        const esValido = (nombreFinanciador: any) => {
            const nomStr = String(nombreFinanciador || '');
            return nomStr && nomStr !== 'Sin obra social' && nomStr !== 'otras';
        };

        // 1. Si la prestación ya tiene obraSocial asignada (y no es 'Sin obra social' / 'otras')
        if (this.prestacion?.paciente?.obraSocial) {
            const os = this.prestacion.paciente.obraSocial;
            const nom = os.nombre || os.financiador || '';
            if (esValido(nom)) {
                this.financiadoresPaciente.push({
                    nombre: nom,
                    codigoFinanciador: os.codigoFinanciador || 0,
                    version: new Date(),
                    numeroAfiliado: os.numeroAfiliado || '',
                    financiador: os.financiador || os.nombre || null,
                    codigoPuco: os.codigoPuco || null,
                    id: os.id || null,
                    transmite: os.transmite || '',
                    prepaga: os.prepaga || false,
                    origen: os.origen || 'ANDES'
                });
            }
        }

        // 2. Si el paciente (MPI) o prestacion.paciente tiene el arreglo de financiadores
        const financiadoresMPI = this.paciente?.financiador || (this.prestacion?.paciente as any)?.financiador || [];
        if (Array.isArray(financiadoresMPI)) {
            financiadoresMPI.forEach((f: any) => {
                const nom = f.nombre || f.financiador || '';
                if (esValido(nom)) {
                    const yaExiste = this.financiadoresPaciente.some(os =>
                        (os.nombre && (os.nombre === f.nombre || os.nombre === f.financiador)) ||
                        (os.financiador && (os.financiador === f.nombre || os.financiador === f.financiador))
                    );
                    if (!yaExiste) {
                        this.financiadoresPaciente.push({
                            nombre: nom,
                            codigoFinanciador: f.codigoFinanciador || 0,
                            version: new Date(),
                            numeroAfiliado: f.numeroAfiliado || '',
                            financiador: f.financiador || f.nombre || null,
                            codigoPuco: f.codigoPuco || null,
                            id: f.id || null,
                            transmite: f.transmite || '',
                            prepaga: f.prepaga || false,
                            origen: f.origen || 'ANDES'
                        });
                    }
                }
            });
        }

        // 3. Si el paciente en MPI tiene propiedad obraSocial directa
        if ((this.paciente as any)?.obraSocial) {
            const os = (this.paciente as any).obraSocial;
            const nom = os.nombre || os.financiador || '';
            if (esValido(nom)) {
                const yaExiste = this.financiadoresPaciente.some(f =>
                    (f.nombre && (f.nombre === os.nombre || f.nombre === os.financiador))
                );
                if (!yaExiste) {
                    this.financiadoresPaciente.push({
                        nombre: nom,
                        codigoFinanciador: os.codigoFinanciador || 0,
                        version: new Date(),
                        numeroAfiliado: os.numeroAfiliado || '',
                        financiador: os.financiador || os.nombre || null,
                        codigoPuco: os.codigoPuco || null,
                        id: os.id || null,
                        transmite: os.transmite || '',
                        prepaga: os.prepaga || false,
                        origen: os.origen || 'ANDES'
                    });
                }
            }
        }

        if (this.prestacion?.paciente) {
            this.showSelector = true;

            const obraSocialActual = this.prestacion.paciente.obraSocial;

            if (this.financiadoresPaciente.length > 0 && (!obraSocialActual || (obraSocialActual.nombre !== 'Sin obra social' && obraSocialActual.nombre !== 'otras'))) {
                // Si la prestación no tenía obraSocial asignada previamente, asignamos la primera encontrada a la prestación
                if (!this.prestacion.paciente.obraSocial) {
                    const primerFinanciador = this.financiadoresPaciente[0];
                    this.prestacion.paciente.obraSocial = <IObraSocial>{
                        id: primerFinanciador.id || null,
                        nombre: primerFinanciador.nombre,
                        financiador: primerFinanciador.financiador,
                        codigoPuco: primerFinanciador.codigoPuco,
                        numeroAfiliado: primerFinanciador.numeroAfiliado || '',
                        prepaga: primerFinanciador.prepaga || false,
                        origen: primerFinanciador.origen || 'ANDES'
                    };
                }

                const { financiador, nombre, numeroAfiliado } = this.prestacion.paciente.obraSocial;
                this.financiadorSeleccionado = nombre || financiador;

                const numeroAfiliadoActual = this.numeroAfiliado;
                const numeroAfiliadoPrestacion = (numeroAfiliado as string) || '';
                this.numeroAfiliado = numeroAfiliadoActual || numeroAfiliadoPrestacion;
            } else {
                // Si el paciente no tiene financiadores válidos o ya tiene seleccionado 'Sin obra social'
                this.financiadorSeleccionado = 'Sin obra social';
                this.numeroAfiliado = '';
                this.prestacion.paciente.obraSocial = <IObraSocial>{
                    id: null,
                    nombre: 'Sin obra social',
                    financiador: 'Sin obra social',
                    codigoPuco: null,
                    numeroAfiliado: '',
                    prepaga: false,
                    origen: 'ANDES'
                };
            }

            this.datosFinanciadores = [
                ...this.financiadoresPaciente.map((os: IObraSocial) => ({
                    id: os.nombre || os.financiador,
                    label: os.nombre || os.financiador
                })),
                { id: 'otras', label: 'Otras' },
                { id: 'Sin obra social', label: 'Sin obra social' }
            ];
        } else {
            this.showSelector = false;
            this.financiadorSeleccionado = undefined;
        }
        this.cargarOpcionesFinanciadores();
    }

    private cargarOpcionesFinanciadores() {
        this.obraSocialService.getListado({}).subscribe((financiadores: any[]) => {
            const financiadoresExistentes = [
                ...this.financiadoresPaciente.map((f) => f.nombre)
            ];

            this.opcionesFinanciadores = financiadores.filter(
                (financiador) => !financiadoresExistentes.includes(financiador.nombre)
            );
        });
    }

    public seleccionarFinanciador(event) {
        this.showListado = false;

        if (event.value === 'otras') {
            this.showListado = true;
            this.numeroAfiliado = undefined;
        } else if (event.value === 'Sin obra social') {
            if (this.prestacion?.paciente) {
                this.numeroAfiliado = '';
                this.prestacion.paciente.obraSocial = <IObraSocial>{
                    id: null,
                    nombre: 'Sin obra social',
                    financiador: 'Sin obra social',
                    codigoPuco: null,
                    numeroAfiliado: '',
                    prepaga: false,
                    origen: 'ANDES'
                };
            }
        } else {
            const nombre = event.value;
            const obraSocialSeleccionada = this.financiadoresPaciente.find(
                os => os.nombre === nombre || os.financiador === nombre
            );

            if (obraSocialSeleccionada && this.prestacion?.paciente) {
                this.numeroAfiliado = obraSocialSeleccionada.numeroAfiliado as string || '';
                this.prestacion.paciente.obraSocial = <IObraSocial>{
                    nombre: obraSocialSeleccionada.nombre,
                    financiador: obraSocialSeleccionada.financiador,
                    codigoPuco: obraSocialSeleccionada.codigoPuco,
                    numeroAfiliado: obraSocialSeleccionada.numeroAfiliado || '',
                    prepaga: obraSocialSeleccionada.prepaga || false,
                    origen: obraSocialSeleccionada.origen || 'ANDES'
                };
            }
        }
    }

    public seleccionarOtroFinanciador(event) {
        if (event.value && this.prestacion?.paciente) {
            const { prepaga, nombre, financiador, codigoPuco } = event.value;

            this.prestacion.paciente.obraSocial = {
                id: null,
                nombre,
                financiador,
                codigoPuco,
                numeroAfiliado: this.numeroAfiliado || '',
                prepaga: prepaga || false,
                origen: 'ANDES'
            };

            const nuevaObraSocial = {
                nombre,
                numeroAfiliado: this.numeroAfiliado || '',
                financiador,
                codigoPuco,
                id: null,
                prepaga: prepaga || false,
                origen: 'ANDES'
            };

            const yaExiste = this.financiadoresPaciente.find(os =>
                (os.nombre === nombre || os.financiador === financiador)
            );

            if (!yaExiste) {
                this.financiadoresPaciente.push(nuevaObraSocial);
            }

            this.financiadorSeleccionado = nombre || financiador;
            this.datosFinanciadores = [
                ...this.financiadoresPaciente.map((os: IObraSocial) => ({
                    id: os.nombre || os.financiador,
                    label: os.nombre || os.financiador
                })),
                { id: 'otras', label: 'Otras' },
                { id: 'Sin obra social', label: 'Sin obra social' }
            ];

            this.showListado = false;
        }
    }

    public actualizarNumeroAfiliado() {
        if (!this.numeroAfiliado || this.numeroAfiliado.toString().trim() === '') {
            return;
        }

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.prestacion?.paciente?.obraSocial && this.numeroAfiliado && this.numeroAfiliado.toString().trim() !== '') {
                const obraSocialActual = this.financiadoresPaciente.find(os =>
                    os.nombre === this.prestacion.paciente.obraSocial.nombre ||
                    os.financiador === this.prestacion.paciente.obraSocial.financiador
                );

                if (obraSocialActual) {
                    obraSocialActual.numeroAfiliado = this.numeroAfiliado;
                }

                // Actualizar solo el primer financiador si existe
                if (this.financiadoresPaciente && this.financiadoresPaciente.length > 0) {
                    this.financiadoresPaciente[0].numeroAfiliado = this.numeroAfiliado;
                }
            }
        }, 500);
    }
}

