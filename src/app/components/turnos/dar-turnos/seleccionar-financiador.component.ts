import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';
import { ObraSocialService } from 'src/app/services/obraSocial.service';
import { ConstantesService } from './../../../services/constantes.service';

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
    public patronNumerico = '^[0-9]*$';
    private timeout: any;
    public busquedaFinanciador;

    @Input() paciente;
    @Input() editable = false;
    @Output() setFinanciador = new EventEmitter<any>();
    @Output() setPaciente = new EventEmitter<IPaciente>();
    @Input() financiadorActual: any;
    constructor(
        public obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,
        private constantesService: ConstantesService,
    ) { }


    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente?.currentValue?.id) {
            this.numeroAfiliado = this.paciente?.financiador?.length ? this.paciente.financiador[0]?.numeroAfiliado : undefined;
            this.resetComponentState();

            if (this.editable) {
                this.cargarDatosModoEditable();
            } else {
                this.cargarDatosModoLectura(changes.paciente.currentValue.id);
            }
        } else if (changes.financiadorActual && this.paciente?.id) {
            this.cargarOpcionesObraSocial(this.paciente);
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
            let financiadorParaSeleccion;

            if (this.financiadorActual && this.financiadorActual.nombre) {
                const nombreFinanciadorPrestacion = this.financiadorActual.nombre;

                financiadorParaSeleccion = this.financiadoresPaciente.find(
                    os => os.nombre === nombreFinanciadorPrestacion
                );
            }

            if (!financiadorParaSeleccion) {
                financiadorParaSeleccion = this.paciente.obraSocial ? this.paciente.obraSocial : this.financiadoresPaciente[0];
            }

            const { financiador, nombre, numeroAfiliado } = financiadorParaSeleccion;

            this.busquedaFinanciador = financiadorParaSeleccion;
            this.financiadorSeleccionado = nombre || financiador;
            this.numeroAfiliado = numeroAfiliado || '';

            this.datosFinanciadores = [
                ...this.financiadoresPaciente.map((os: IObraSocial) => ({
                    id: os.nombre || os.financiador,
                    label: (os.nombre || os.financiador) + (os.origen ? ` (${this.toBold('ORIGEN: ' + os.origen)})` : '')
                })),
                { id: 'otras', label: 'Otras' }
            ];

        } else {
            this.financiadorSeleccionado = this.paciente.obraSocial
                ? this.paciente.obraSocial.nombre
                : undefined;

            this.numeroAfiliado = this.paciente.obraSocial
                ? this.paciente.obraSocial.numeroAfiliado
                : '';
        }

        this.guardarFinanciador();
    }


    private actualizarPaciente() {
        this.paciente.financiador = this.financiadoresANDES.map(financiador => ({ ...financiador, origen: 'ANDES' }));
    }

    private cargarFinanciadoresPorOrigen(origen: string) {
        return this.paciente?.financiador?.filter(
            (financiador: any) => financiador?.origen === origen
        ) ?? [];
    }

    private cargarOpcionesFinanciadores() {
        this.obraSocialService.getListado({}).subscribe((financiadores: any[]) => {
            const financiadoresExistentes = [
                ...this.obrasSocialesPUCO.map((f) => f.nombre),
                ...this.financiadoresANDES.map((f) => f.nombre),
                ...this.financiadoresPaciente?.map((f) => f && f.nombre)
            ];

            this.opcionesFinanciadores = financiadores.filter(
                (financiador) => !financiadoresExistentes.includes(financiador.nombre)
            );
        });
    }

    public seleccionarFinanciador(event) {
        this.showListado = false;
        const nombreSeleccionado = event.value;

        if (nombreSeleccionado === 'otras') {
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
            this.constantesService.search({ source: 'mpi:pacientes:update' }).subscribe(async (constante) => {
                if (codigoPuco === parseInt(constante[0]?.key, 10)) {
                    this.numeroAfiliado = this.paciente.documento;
                }
            });
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
            this.numeroAfiliado = value?.length ? value : undefined;

            if (!this.editable) { this.guardarFinanciador(); }
        }, 500);
    }

    public onSeleccionarFinanciador(event: any) {
        this.numeroAfiliado = null;
        this.constantesService.search({ source: 'mpi:pacientes:update' }).subscribe(async (constante) => {
            if (event?.value?.codigoPuco === parseInt(constante[0]?.key, 10)) {
                this.numeroAfiliado = this.paciente.documento;
            }
        });
    }

    private toBold(text: string) {
        const boldChars = {
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        return text.split('').map(char => boldChars[char] || char).join('');
    }
}
