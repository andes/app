import {
    Component,
    OnInit,
    Input,
    HostBinding,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';
import { Plex } from '@andes/plex';
import { ParentescoService } from '../../../services/parentesco.service';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteService } from '../services/paciente.service';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PacienteBuscarComponent } from '../../../modules/mpi/components/paciente-buscar.component';

@Component({
    selector: 'relaciones-pacientes',
    templateUrl: 'relaciones-pacientes.html',
    styleUrls: ['relaciones-pacientes.scss']
})
export class RelacionesPacientesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; //  Permite el uso de flex-box en el componente
    @ViewChild('buscador', null) buscador: PacienteBuscarComponent;
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

    _paciente: IPaciente;
    parentescoModel: any[] = [];
    relacionesBorradas: any[] = [];
    relacionesIniciales: any[] = [];
    posiblesRelaciones: any[] = [];
    relacionEntrante: any[] = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    buscarPacRel = '';
    idPacientesRelacionados = []; // para foto-directive
    loading = false;
    searchClear = true;    // true si el campo de búsqueda se encuentra vacío

    public nombrePattern: string;

    constructor(
        private parentescoService: ParentescoService,
        private pacienteService: PacienteService,
        public plex: Plex) { }


    ngOnInit() {
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
    }

    // -------------- SOBRE BUSCADOR ----------------

    onSearchStart() {
        this.loading = true;
        this.relacionEntrante = [];
    }

    onSearchEnd(pacientes: IPaciente[]) {
        if (pacientes) {
            this.searchClear = false;
            this.loading = false;
            this.actualizarPosiblesRelaciones(pacientes);
        }
    }

    onSearchClear() {
        this.searchClear = true;
        this.posiblesRelaciones = [];
    }

    toPacienteBuscarOnScroll() {
        this.buscador.onScroll();
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

    seleccionarRelacionEntrante(data: IPaciente | IPacienteRelacion) {
        if (data.id) {
            this.relacionEntrante = [data];
            this.onSearchClear();
        }
    }

    addRelacion(unaRelacion) {
        // es una relacion existente?
        if (unaRelacion.referencia) {
            // notificamos cambios
            this.actualizar.emit({ relaciones: this.paciente.relaciones, relacionesBorradas: this.relacionesBorradas });
        } else {
            // relacion inexistente, construimos una nueva
            this.buscarPacRel = '';
            let nuevaRelacion: IPacienteRelacion = Object.assign({}, {
                id: null,
                relacion: null,
                referencia: null,
                nombre: '',
                apellido: '',
                documento: '',
                fechaFallecimiento: null,
                numeroIdentificacion: '',
                foto: ''
            });

            // Se completan los campos de la nueva relación
            nuevaRelacion.referencia = unaRelacion.id;
            nuevaRelacion.apellido = unaRelacion.apellido;
            nuevaRelacion.nombre = unaRelacion.nombre;
            nuevaRelacion.relacion = unaRelacion.relacion;
            if (unaRelacion.documento) {
                nuevaRelacion.documento = unaRelacion.documento;
            }
            if (unaRelacion.numeroIdentificacion) {
                nuevaRelacion.numeroIdentificacion = unaRelacion.numeroIdentificacion;
            }
            if (unaRelacion.foto) {
                nuevaRelacion.foto = unaRelacion.foto;
            }
            if (unaRelacion.fechaFallecimiento) {
                nuevaRelacion.fechaFallecimiento = unaRelacion.fechaFallecimiento;
            }

            // Se inserta nueva relación en array de relaciones del paciente
            let index = null;
            if (this.paciente.relaciones && this.paciente.relaciones.length) {
                this.paciente.relaciones.push(nuevaRelacion);
            } else {
                this.paciente.relaciones = [nuevaRelacion];
            }
            // notificamos cambios
            this.actualizar.emit({ relaciones: this.paciente.relaciones, relacionesBorradas: this.relacionesBorradas });
            this.idPacientesRelacionados.push({ id: nuevaRelacion.referencia });

            // Si esta relación fue borrada anteriormente en esta edición, se quita del arreglo 'relacionesBorradas'
            index = this.relacionesBorradas.findIndex(rel => rel.documento === nuevaRelacion.documento);
            if (index < 0) {
                index = this.relacionesBorradas.findIndex(rel => rel.numeroIdentificacion === nuevaRelacion.numeroIdentificacion);
            }
            if (index >= 0) {
                this.relacionesBorradas.splice(index, 1);
            }
        }
        // Se borra la edicion en panel principal.
        this.relacionEntrante = [];
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


    public onChange(data) {
        let index = this.paciente.relaciones.findIndex((rel: any) => rel.referencia === data.idRelacionado);
        if (index >= 0) {
            if (data.operacion === 'edit') {
                // se muestra en panel principal para su edicion
                this.seleccionarRelacionEntrante(this.paciente.relaciones[index]);
            }
            if (data.operacion === 'remove') {
                this.removeRelacion(index);
            }
        }
    }
}
