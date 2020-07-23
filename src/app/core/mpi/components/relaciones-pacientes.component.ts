import {
    Component,
    OnInit,
    Input,
    HostBinding,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter
} from '@angular/core';
import { Plex } from '@andes/plex';
import { ParentescoService } from '../../../services/parentesco.service';
import { IPaciente } from '../interfaces/IPaciente';

@Component({
    selector: 'relaciones-pacientes',
    templateUrl: 'relaciones-pacientes.html',
    styleUrls: ['relaciones-pacientes.scss']
})
export class RelacionesPacientesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; //  Permite el uso de flex-box en el componente
    @Input()
    set paciente(valor: IPaciente) {
        this._paciente = valor;
        // Se guarda estado de las relaciones al comenzar la edición
        if (valor.relaciones) {
            this.relacionesIniciales = valor.relaciones.slice(0, valor.relaciones.length);
            this.idPacientesRelacionados = this.relacionesIniciales.map(rel => { return { id: rel.referencia }; });
        }
    }
    get paciente(): IPaciente {
        return this._paciente;
    }
    @Output() actualizar: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('listadoRel', { static: true }) listado: ElementRef;

    _paciente: IPaciente;
    parentescoModel: any[] = [];
    relacionesBorradas: any[] = [];
    relacionesIniciales: any[] = [];
    posiblesRelaciones: any[] = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    buscarPacRel = '';
    idPacientesRelacionados = []; // para foto-directive
    loading = false;
    searchClear = true;    // true si el campo de búsqueda se encuentra vacío

    public nombrePattern: string;

    constructor(
        private parentescoService: ParentescoService,
        public plex: Plex) { }


    ngOnInit() {
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
    }

    // -------------- SOBRE BUSCADOR ----------------

    onSearchStart() {
        this.loading = true;
    }

    onSearchEnd(pacientes: IPaciente[]) {
        if (pacientes) {
            this.searchClear = false;
            this.loading = false;
            this.actualizarPosiblesRelaciones(pacientes);
            if (this.paciente.relaciones && this.paciente.relaciones.length > 2) {
                // scroll hacia resultado de búsqueda
                window.setTimeout(() => {
                    this.listado.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200);
            }
        }
    }

    onSearchClear() {
        this.searchClear = true;
        this.posiblesRelaciones = [];
    }

    // ------------- SOBRE RELACIONES ---------------

    // Resultado de la búsqueda de pacientes para relacionar (Tab 'relaciones')
    actualizarPosiblesRelaciones(listaPacientes: any[]) {
        // Se elimina el paciente en edición
        listaPacientes = listaPacientes.filter(p => p.id !== this.paciente.id);

        // Se eliminan de los resultados de la búsqueda los pacientes ya relacionados
        if (this.paciente.relaciones && this.paciente.relaciones.length) {
            for (let i = 0; i < this.paciente.relaciones.length; i++) {
                listaPacientes = listaPacientes.filter(p => p.id !== this.paciente.relaciones[i].referencia);
            }
        }
        this.posiblesRelaciones = listaPacientes;
    }

    seleccionarPacienteRelacionado(pacienteEncontrado) {
        if (pacienteEncontrado) {
            let permitirNuevaRelacion = this.checkVinculo();
            // Control: Si los datos de las relaciones agregadas anteriormente no estan completas, no se permitira agregar nuevas.
            if (permitirNuevaRelacion) {
                this.buscarPacRel = '';
                let unaRelacion = Object.assign({}, {
                    relacion: null,
                    referencia: null,
                    nombre: '',
                    apellido: '',
                    documento: '',
                    numeroIdentificacion: '',
                    foto: ''
                });

                // Se completan los campos de la nueva relación
                unaRelacion.referencia = pacienteEncontrado.id;
                unaRelacion.apellido = pacienteEncontrado.apellido;
                unaRelacion.nombre = pacienteEncontrado.nombre;
                if (pacienteEncontrado.documento) {
                    unaRelacion.documento = pacienteEncontrado.documento;
                }
                if (pacienteEncontrado.numeroIdentificacion) {
                    unaRelacion.numeroIdentificacion = pacienteEncontrado.numeroIdentificacion;
                }
                if (pacienteEncontrado.foto) {
                    unaRelacion.foto = pacienteEncontrado.foto;
                }

                // Se inserta nueva relación en array de relaciones del paciente
                let index = null;
                if (this.paciente.relaciones && this.paciente.relaciones.length) {
                    this.paciente.relaciones.push(unaRelacion);
                } else {
                    this.paciente.relaciones = [unaRelacion];
                }
                // notificamos cambios
                this.actualizar.emit({ relaciones: this.paciente.relaciones, relacionesBorradas: this.relacionesBorradas });
                this.idPacientesRelacionados.push({ id: unaRelacion.referencia });

                // Si esta relación fue borrada anteriormente en esta edición, se quita del arreglo 'relacionesBorradas'
                index = this.relacionesBorradas.findIndex(rel => rel.documento === unaRelacion.documento);
                if (index < 0) {
                    index = this.relacionesBorradas.findIndex(rel => rel.numeroIdentificacion === unaRelacion.numeroIdentificacion);
                }
                if (index >= 0) {
                    this.relacionesBorradas.splice(index, 1);
                }
                // Se borran los resultados de la búsqueda.
                this.posiblesRelaciones = null;
            } else {
                this.plex.toast('info', 'Antes de agregar una nueva relación debe completar las existentes.', 'Información');
            }
        }
    }

    // Dado un indice, retorna el tipo de vinculo segun el array de relaciones del paciente
    // Si indice es undefined, retorna siempre true indicando que se puede agregar una nueva relacion
    private checkVinculo(index?): Boolean {
        let relacion = null;
        if (this.paciente.relaciones && this.paciente.relaciones.length) {
            if (!index) {
                index = this.paciente.relaciones.length - 1;
            }
            relacion = this.paciente.relaciones[index];
            return relacion.relacion;
        }
        return true;
    }

    removeRelacion(i) {
        if (i >= 0) {
            // si la relacion borrada ya se encotraba almacenada en la DB
            let index = this.relacionesIniciales.findIndex(unaRel => unaRel.documento === this.paciente.relaciones[i].documento);
            if (index < 0) {
                index = this.relacionesIniciales.findIndex(unaRel => unaRel.numeroIdentificacion === this.paciente.relaciones[i].numeroIdentificacion);
            }
            if (index >= 0) {
                this.relacionesBorradas.push(this.paciente.relaciones[i]);
            }
            this.paciente.relaciones.splice(i, 1);
            this.idPacientesRelacionados = this.paciente.relaciones.map(rel => { return { id: rel.referencia }; });
            // notificamos cambios
            this.actualizar.emit({ relaciones: this.paciente.relaciones, relacionesBorradas: this.relacionesBorradas });
        }
    }

    cambioRelacion(i) {
        if (this.checkVinculo(i)) {
            this.actualizar.emit({ relaciones: this.paciente.relaciones, relacionesBorradas: this.relacionesBorradas });
        }
    }
}
