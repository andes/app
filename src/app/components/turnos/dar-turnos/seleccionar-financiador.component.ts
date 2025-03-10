import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';
import { ObraSocialService } from 'src/app/services/obraSocial.service';

@Component({
    selector: 'seleccionar-financiador',
    templateUrl: 'seleccionar-financiador.html',
    styleUrls: ['seleccionar-financiador.scss']
})

export class SeleccionarFinanciadorComponent implements OnChanges {
    public financiadoresPaciente: IObraSocial[] = [];
    public datosFinanciadores = [];
    public financiadorSeleccionado;
    public otroFinanciadorSeleccionado;
    public showSelector = false;
    public showListado = false;
    public financiadorBase = {
        nombre: undefined,
        financiador: undefined,
        prepaga: false,
        codigoPuco: undefined,
        numeroAfiliado: undefined
    };

    public obrasSocialesPUCO: any[] = [];
    public financiadoresANDES: any[] = [];
    public opcionesFinanciadores: any[] = [];
    public itemListaFinanciador: any;
    public numeroAfiliado: string;

    private timeout: any;
    private busquedaFinanciador;

    @Input() paciente;
    @Input() editable = false;
    @Output() setFinanciador = new EventEmitter<any>();
    @Output() setPaciente = new EventEmitter<IPaciente>();

    constructor(
        public obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,
    ) { }


    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente?.currentValue?.id) {
            this.resetComponentState();

            if (this.editable) {
                this.cargarDatosModoEditable();
            } else {
                this.cargarDatosModoLectura(changes.paciente.currentValue.id);
            }
        }
    }

    private resetComponentState() {
        this.showSelector = false;
        this.showListado = false;
        this.otroFinanciadorSeleccionado = undefined;
    }

    private cargarDatosModoEditable() {
        this.financiadoresANDES = this.cargarFinanciadoresPorOrigen('ANDES');
        this.obrasSocialesPUCO = this.cargarFinanciadoresPorOrigen('PUCO');

        this.cargarOpcionesFinanciadores();
    }

    private cargarDatosModoLectura(pacienteId: string) {
        if (!this.paciente.financiador) {
            this.pacienteService.getById(pacienteId).subscribe((paciente) => {
                this.cargarOpcionesObraSocial(paciente);
                this.cargarOpcionesFinanciadores();
            });
        } else {
            this.cargarOpcionesObraSocial(this.paciente);
            this.cargarOpcionesFinanciadores();
        }
    }

    private cargarOpcionesObraSocial(paciente) {
        if (!paciente) {
            return;
        } else {
            this.financiadoresPaciente = paciente.financiador;
        }

        this.showSelector = true;

        if (this.financiadoresPaciente?.length) {
            const { financiador, nombre } = this.financiadoresPaciente[0];

            this.busquedaFinanciador = this.financiadoresPaciente[0];
            this.financiadorSeleccionado = nombre || financiador;
            this.datosFinanciadores = [
                ...this.financiadoresPaciente.map((os: IObraSocial) => ({ id: os.nombre || os.financiador, label: os.nombre || os.financiador })),
                { id: 'otras', label: 'Otras' }
            ];
        } else {
            this.financiadorSeleccionado = undefined;
        }

        this.guardarFinanciador();
    }


    private actualizarPaciente() {
        this.paciente.financiador = this.financiadoresANDES.map(financiador => ({ ...financiador, origen: 'ANDES' }));
    }

    private cargarFinanciadoresPorOrigen(origen: string) {
        return this.paciente.financiador.filter(
            (financiador: any) => financiador.origen === origen
        );
    }

    private cargarOpcionesFinanciadores() {
        this.obraSocialService.getListado({}).subscribe((financiadores: any[]) => {
            const financiadoresExistentes = [
                ...this.obrasSocialesPUCO.map((f) => f.nombre),
                ...this.financiadoresANDES.map((f) => f.nombre),
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
            this.busquedaFinanciador = undefined;
        } else {
            const nombre = event.value;

            this.busquedaFinanciador = this.financiadoresPaciente.find(os => os.nombre === nombre || os.financiador === nombre);
            this.numeroAfiliado = this.busquedaFinanciador.numeroAfiliado;

            this.guardarFinanciador();
        }
    }

    public guardarFinanciador() {
        if (this.busquedaFinanciador) {
            this.busquedaFinanciador.numeroAfiliado = this.numeroAfiliado;
        }

        const existeFinanciador = this.paciente.financiador?.some(
            (financiador: any) => financiador.nombre === this.busquedaFinanciador.nombre
        );

        if (!existeFinanciador) {
            this.paciente.financiador?.push(this.busquedaFinanciador);
            this.actualizarPaciente();
        }

        this.setFinanciador.emit(this.busquedaFinanciador);
    }

    public seleccionarOtro(event) {
        this.numeroAfiliado = undefined;

        if (event.value) {
            const { prepaga, nombre, financiador, codigoPuco } = event.value;
            this.busquedaFinanciador = { prepaga: prepaga || false, nombre, financiador, codigoPuco, origen: 'ANDES' };
        }

        this.guardarFinanciador();
    }

    public agregarFinanciador(financiador: any) {
        if (financiador) {
            this.financiadoresANDES.push({ ...financiador, numeroAfiliado: this.numeroAfiliado, fechaDeActualizacion: new Date() });
            this.itemListaFinanciador = null;
            this.numeroAfiliado = null;

            this.cargarOpcionesFinanciadores();
            this.actualizarPaciente();
        }
    }

    public eliminarFinanciador(index: number) {
        this.financiadoresANDES.splice(index, 1);
        this.cargarOpcionesFinanciadores();
        this.actualizarPaciente();
    }

    public setNumeroAfiliado({ value }) {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.numeroAfiliado = value.length ? value : undefined;

            if (!this.editable) { this.guardarFinanciador(); }
        }, 500);
    }
}
