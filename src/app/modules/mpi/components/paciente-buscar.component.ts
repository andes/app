import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';
import { PacienteBuscarService } from '../../../core/mpi/services/paciente-buscar.service';
import { Subscription, of } from 'rxjs';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';


interface PacienteEscaneado {
    documento: string;
    apellido: string;
    nombre: string;
    sexo: string;
    fechaNacimiento: Date;
    scan: string;
}

@Component({
    selector: 'paciente-buscar',
    templateUrl: 'paciente-buscar.html',
    styleUrls: []
})
export class PacienteBuscarComponent implements OnInit, OnDestroy {
    public textoLibre: string = null;
    private limit = 10;
    private skip = 0;
    private scrollEnd = false;
    public autoFocus = 0;
    public loading = false;
    public routes;
    public listado: IPaciente[];
    private pacienteRoute = '/apps/mpi/paciente';
    private searchSubscription = new Subscription();
    pacienteSeleccionado: IPaciente;
    selectedId: string;

    get disabled() {
        return !this.textoLibre || this.textoLibre.length === 0;
    }
    // Indica el modulo llamador
    @Input() hostComponent = '';

    // Indica se deben mostrarse los botones (Dropdown) para alta de pacientes
    @Input() create = false;
    /* returnScannedPatient en true retorna un objeto con los datos del paciente escaneado en caso de
        que este no estuviera registrado */
    @Input() returnScannedPatient = false;

    // Indica si debe aparecer el boton 'editar' en cada resultado
    @Input() editing = false;

    // Indica la altura de la ventana de scroll'
    @Input() height: Number = 80;

    // Evento que se emite cuando se selecciona un paciente (click en la lista)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se presiona el boton 'editar' de un paciente
    @Output() edit: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se scrollea en la lista
    @Output() scrolled: EventEmitter<null> = new EventEmitter<null>();

    // Evento que se emite al comenzar una búsqueda
    @Output() searchStart: EventEmitter<any> = new EventEmitter<any>();
    // Evento que se emite al finalizar la búsqueda. Envía el resultado
    @Output() searchEnd: EventEmitter<PacienteBuscarResultado> = new EventEmitter<PacienteBuscarResultado>();

    // Evento que se emite al borrar completamente el campo de búsqueda
    @Output() searchClear: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private pacienteBuscar: PacienteBuscarService) {
    }

    public ngOnInit() {
        this.autoFocus = this.autoFocus + 1;
        this.routes = [
            { label: 'BEBÉ', route: `${this.pacienteRoute}/bebe/${this.hostComponent}` },
            { label: 'EXTRANJERO', route: `${this.pacienteRoute}/extranjero/${this.hostComponent}` },
            { label: 'CON DNI ARGENTINO', route: `${this.pacienteRoute}/con-dni/${this.hostComponent}` },
            { label: 'SIN DNI ARGENTINO', route: `${this.pacienteRoute}/sin-dni/${this.hostComponent}` },
        ];
    }

    ngOnDestroy(): void {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    /**
     * Busca paciente cada vez que el campo de busqueda cambia su valor
     */
    public buscar($event) {
        /* Error en Plex, ejecuta un change cuando el input pierde el foco porque detecta que cambia el valor */
        if ($event.type) {
            return;
        }
        // reiniciamos variables utilizadas por infinity-scroll
        this.skip = 0;
        this.scrollEnd = false;

        if (this.textoLibre && this.textoLibre.length) {
            this.textoLibre = this.textoLibre.trim();

            // Controla el scanner
            if (!this.pacienteBuscar.controlarScanner(this.textoLibre)) {
                this.plex.info('warning', 'El lector de código de barras no está configurado. Comuníquese con la Mesa de Ayuda de TICS');
                return;
            }
            if (this.searchSubscription) {
                this.searchSubscription.unsubscribe();
            }
            this.searchStart.emit();
            this.loading = true;
            this.pacienteBuscar.search(this.textoLibre, this.skip, this.limit).subscribe(respuesta => {
                if (respuesta) {
                    // si vienen menos pacientes que {{ limit }} significa que ya se cargaron todos
                    if (!respuesta.pacientes.length || respuesta.pacientes.length < this.limit) {
                        this.scrollEnd = true;
                    }
                    this.searchEnd.emit(respuesta);
                    this.loading = false;
                    this.listado = respuesta.pacientes;
                    this.skip = this.listado.length;
                }
            });
        } else {
            this.searchClear.emit();
        }
    }

    // LISTADO (REULTADO DE BUSQUEDA) -------------------------

    public seleccionar(paciente: IPaciente) {
        (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
    }

    public editar(paciente: IPaciente) {
        (paciente.id) ? this.edit.emit(paciente) : this.edit.emit(null);
    }

    public onScroll() {
        if (this.scrollEnd) {
            return;
        }
        this.pacienteBuscar.search(this.textoLibre, this.skip, this.limit).subscribe(respuesta => {
            if (respuesta) {
                // si vienen menos pacientes que {{ limit }} significa que ya se cargaron todos
                if (!respuesta.pacientes.length || respuesta.pacientes.length < this.limit) {
                    this.scrollEnd = true;
                }
                this.loading = false;
                this.listado = this.listado.concat(respuesta.pacientes);
                this.skip = this.listado.length;
            }
        });
    }

    /**
     * retorna true/false al querer mostrar el documento del tutor de un paciente menor  de 5 años
     * @param paciente
     */
    public showDatosTutor(paciente: IPaciente) {
        //  si es un paciente sin documento menor a 5 años mostramos datos de un familiar/tutor
        const edad = 5;
        const rel = paciente.relaciones;
        return !paciente.documento && !paciente.numeroIdentificacion && paciente.edad < edad && rel !== null && rel.length > 0;
    }
}
