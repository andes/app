import { Unsubscribe } from '@andes/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RupElement } from '.';
import { IObraSocial } from '../../../../interfaces/IObraSocial';
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

    public financiadoresPaciente: IObraSocial[] = [];
    public datosFinanciadores = [];
    public financiadorSeleccionado;
    public otroFinanciadorSeleccionado;
    public showSelector = false;
    public showListado = false;
    public opcionesFinanciadores: any[] = [];
    public numeroAfiliado = '';
    public patronNumerico = '^[0-9]*$';
    private timeout: any;


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
            const numeroAfiliadoTemporal = this.numeroAfiliado;
            this.loadRegistros();
            if (numeroAfiliadoTemporal && !this.numeroAfiliado) {
                this.numeroAfiliado = numeroAfiliadoTemporal;
            }
        });

        this.eclqueriesServicies.search({ key: '^receta' }).subscribe(query => {
            this.eclInsumos = query.filter(q => q.key === 'receta:dispositivos');
        });

        setTimeout(() => {
            this.cargarObrasSocialesPaciente();
        }, 100);

        if (this.paciente) {
            this.cargarObrasSocialesPaciente();
        }
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

    public onValidate() {
        if (this.prestacion?.paciente?.obraSocial) {
            this.prestacion.paciente.obraSocial.numeroAfiliado = this.numeroAfiliado || '';
        }
        return this.registro.valor.insumos && this.registro.valor.insumos.length > 0;
    }

    cargarObrasSocialesPaciente() {
        if (this.prestacion?.paciente?.obraSocial) {
            this.financiadoresPaciente = [{
                nombre: this.prestacion.paciente.obraSocial.nombre || '',
                codigoFinanciador: 0,
                version: new Date(),
                numeroAfiliado: this.prestacion.paciente.obraSocial.numeroAfiliado || '',
                financiador: this.prestacion.paciente.obraSocial.financiador || null,
                codigoPuco: this.prestacion.paciente.obraSocial.codigoPuco || null,
                id: this.prestacion.paciente.obraSocial.id || null,
                transmite: '',
                prepaga: this.prestacion.paciente.obraSocial.prepaga || false,
                origen: this.prestacion.paciente.obraSocial.origen || 'ANDES'
            }];
            this.showSelector = true;

            const { financiador, nombre } = this.financiadoresPaciente[0];

            this.financiadorSeleccionado = nombre || financiador;

            const numeroAfiliadoActual = this.numeroAfiliado;
            const numeroAfiliadoPrestacion = this.prestacion.paciente.obraSocial.numeroAfiliado as string || '';
            this.numeroAfiliado = numeroAfiliadoActual || numeroAfiliadoPrestacion;
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

                if (this.financiadoresPaciente && this.financiadoresPaciente.length > 0) {
                    this.financiadoresPaciente[0].numeroAfiliado = this.numeroAfiliado;
                }
            }
        }, 500);
    }
}
