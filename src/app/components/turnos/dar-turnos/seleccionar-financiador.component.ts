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
    public obrasSociales: IObraSocial[] = [];
    public selectorObrasSociales = [];
    public obraSocial;
    public showSelector = false;
    public showListado = false;
    public financiador;
    public financiadorBase = {
        nombre: undefined,
        financiador: undefined,
        prepaga: false,
        codigoPuco: undefined,
    };

    public obrasSocialesPUCO: any[] = [];
    public financiadoresANDES: any[] = [];
    public opcionesFinanciadores: any[] = [];
    public financiadorSeleccionado: any;

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
        this.financiador = undefined;
    }

    private cargarDatosModoEditable() {
        this.cargarObrasSocialesPUCO();
        this.cargarFinanciadoresANDES();
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
            this.obrasSociales = paciente.financiador;
        }

        if (this.obrasSociales?.length) {
            const { codigoPuco, financiador, nombre, origen } = this.obrasSociales[0];

            this.selectorObrasSociales = this.obrasSociales.map((os: IObraSocial) => ({ id: os.nombre || os.financiador, label: os.nombre || os.financiador }));
            this.obraSocial = nombre || financiador;
            this.setFinanciador.emit({ ...this.financiadorBase, codigoPuco, financiador, nombre, origen });

            this.selectorObrasSociales.push({ 'id': 'otras', 'label': 'Otras' });
        } else {
            this.obraSocial = undefined;
            this.setFinanciador.emit(undefined);
        }

        this.showSelector = true;
    }


    private actualizarPaciente() {
        const nuevosFinanciadores = this.financiadoresANDES.map(financiador => ({ ...financiador, origen: 'ANDES' }));

        this.paciente.financiador = nuevosFinanciadores;
    }

    private cargarObrasSocialesPUCO() {
        this.obrasSocialesPUCO = this.paciente.financiador.filter(
            (financiador: any) => financiador.origen === 'PUCO'
        );
    }

    private cargarFinanciadoresANDES() {
        this.financiadoresANDES = this.paciente.financiador.filter(
            (financiador: any) => financiador.origen === 'ANDES'
        );
    }

    private cargarOpcionesFinanciadores() {
        this.obraSocialService.getListado({}).subscribe((financiadores: any[]) => {
            const financiadoresExistentes = [
                ...this.obrasSocialesPUCO.map((f) => f.nombre),
                ...this.financiadoresANDES.map((f) => f.nombre),
                ...this.obrasSociales.map((f) => f.nombre)
            ];

            this.opcionesFinanciadores = financiadores.filter(
                (financiador) => !financiadoresExistentes.includes(financiador.nombre)
            );
        });
    }

    public seleccionarObraSocial(event) {
        this.showListado = false;

        if (event.value === 'otras') {
            this.showListado = true;
        } else {
            const foundObraSocial = this.obrasSociales.find(os => os.nombre === event.value || os.financiador === event.value);
            this.obraSocial = event.value;

            this.setFinanciador.emit({ ...this.financiadorBase, ...foundObraSocial, prepaga: false });
        }
    }

    public seleccionarOtro(event) {
        if (event.value) {
            const { prepaga, nombre, financiador, codigoPuco } = event.value;

            this.setFinanciador.emit({ ...this.financiadorBase, prepaga: prepaga || false, nombre, financiador, codigoPuco, origen: 'ANDES' });
        } else {
            this.setFinanciador.emit(undefined);
        }
    }

    public agregarFinanciador(financiador: any) {
        if (financiador) {
            this.financiadoresANDES.push({ ...financiador, fechaDeActualizacion: new Date() });
            this.cargarOpcionesFinanciadores();
            this.financiadorSeleccionado = null;
            this.actualizarPaciente();
        }
    }

    public eliminarFinanciador(index: number) {
        this.financiadoresANDES.splice(index, 1);
        this.cargarOpcionesFinanciadores();
        this.actualizarPaciente();
    }
}
