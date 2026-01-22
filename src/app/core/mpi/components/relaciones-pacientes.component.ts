import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { Plex } from '@andes/plex';
import { ParentescoService } from '../../../services/parentesco.service';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';

@Component({
    selector: 'relaciones-pacientes',
    templateUrl: 'relaciones-pacientes.html',
    styleUrls: ['relaciones-pacientes.scss']
})
export class RelacionesPacientesComponent implements OnInit {
    @Input()
    set paciente(valor: IPaciente) {
        this._paciente = valor;
        // Se guarda estado de las relaciones al comenzar la edición
        if (valor.relaciones) {
            this.relacionesIniciales = valor.relaciones.slice(0, valor.relaciones.length);
            this.idPacientesRelacionados = this.relacionesIniciales.map(rel => {
                return { id: rel.referencia?.id || rel.referencia?._id || rel.referencia };
            });
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
    relacionesEdit: any[] = []; // relaciones nuevas o existentes editadas
    posiblesRelaciones: any[] = [];
    relacionEntrante: any[] = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    buscarPacRel = '';
    idPacientesRelacionados = []; // para foto-directive
    loading = false;
    searchClear = true; // true si el campo de búsqueda se encuentra vacío

    public nombrePattern: string;
    public esConviviente = false;

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

    // ------------- SOBRE RELACIONES ---------------

    // Resultado de la búsqueda de pacientes para relacionar (Tab 'relaciones')
    actualizarPosiblesRelaciones(listaPacientes: any[]) {
        // Se elimina el paciente en edición
        listaPacientes = listaPacientes.filter(p => p.id !== this.paciente.id);

        // Se eliminan de los resultados de la búsqueda los pacientes ya relacionados
        if (this.paciente.relaciones && this.paciente.relaciones.length) {
            for (let i = 0; i < this.paciente.relaciones.length; i++) {
                listaPacientes = listaPacientes.filter(p => p.id !== (this.paciente.relaciones[i].referencia?.id || this.paciente.relaciones[i].referencia?._id || this.paciente.relaciones[i].referencia));
            }
        }
        this.posiblesRelaciones = listaPacientes;
    }

    seleccionarRelacionEntrante(data: any) {
        if (data.referencia) {
            this.esConviviente = data.relacion.esConviviente;
            // creamos una copia del objeto relacion para no editarla directamente
            this.relacionEntrante = [Object.assign({}, data)];
        } else if (data.id) {
            this.relacionEntrante = [data];
        }
        this.onSearchClear();
    }

    addRelacion(unaRelacion) {
        // Es una relacion existente?
        const idReferencia = unaRelacion.referencia?.id || unaRelacion.referencia?._id || unaRelacion.referencia;
        if (unaRelacion.referencia) {
            unaRelacion.relacion.esConviviente !== undefined ? unaRelacion.relacion.esConviviente = this.esConviviente : unaRelacion.relacion['esConviviente'] = this.esConviviente;
            // Se la agrega al array de relaciones nuevas/editadas
            let index = this.relacionesEdit.findIndex(rel => (rel.referencia?.id || rel.referencia?._id || rel.referencia) === idReferencia);
            index >= 0 ? this.relacionesEdit[index] = unaRelacion : this.relacionesEdit.push(unaRelacion);
            // Se actualiza el array de relaciones del paciente para que impacte en las vistas
            index = this.paciente.relaciones.findIndex(rel => (rel.referencia?.id || rel.referencia?._id || rel.referencia) === idReferencia);
            this.paciente.relaciones[index] = unaRelacion;
        } else {
            // relacion inexistente, construimos una nueva
            this.buscarPacRel = '';
            const nuevaRelacion: IPacienteRelacion = {
                referencia: unaRelacion,
                relacion: unaRelacion.relacion,
                activo: true
            };
            nuevaRelacion.relacion['esConviviente'] = this.esConviviente;

            // Se inserta nueva relación en array de relaciones del paciente
            if (this.paciente.relaciones && this.paciente.relaciones.length) {
                this.paciente.relaciones.push(nuevaRelacion);
            } else {
                this.paciente.relaciones = [nuevaRelacion];
            }
            // Se inserta en el array de relaciones nuevas/editadas
            let index = this.relacionesEdit.findIndex(rel => (rel.referencia?.id || rel.referencia?._id || rel.referencia) === (nuevaRelacion.referencia?.id || nuevaRelacion.referencia?._id || nuevaRelacion.referencia));
            index >= 0 ? this.relacionesEdit[index] = nuevaRelacion : this.relacionesEdit.push(nuevaRelacion);
            this.idPacientesRelacionados.push({ id: nuevaRelacion.referencia.id || nuevaRelacion.referencia });

            // Si esta relación fue borrada anteriormente en esta edición, se quita del arreglo 'relacionesBorradas'
            index = this.relacionesBorradas.findIndex(rel => (rel.referencia?.id || rel.referencia?._id || rel.referencia) === (nuevaRelacion.referencia?.id || nuevaRelacion.referencia?._id || nuevaRelacion.referencia));
            if (index >= 0) {
                this.relacionesBorradas.splice(index, 1);
            }
        }

        // notificamos cambios
        this.actualizar.emit({
            relaciones: this.paciente.relaciones,
            relacionesBorradas: this.relacionesBorradas,
            relacionesEdit: this.relacionesEdit
        });
        // Se borra la edicion en panel principal.
        this.relacionEntrante = [];
    }


    removeRelacion(i) {
        if (i >= 0) {
            // si la relacion borrada ya se encotraba almacenada en la DB
            const idReferenciaBorrar = this.paciente.relaciones[i].referencia?.id || this.paciente.relaciones[i].referencia?._id || this.paciente.relaciones[i].referencia;
            const index = this.relacionesIniciales.findIndex(unaRel => (unaRel.referencia?.id || unaRel.referencia?._id || unaRel.referencia) === idReferenciaBorrar);
            if (index >= 0) {
                this.relacionesBorradas.push(this.paciente.relaciones[i]);
            }
            this.paciente.relaciones.splice(i, 1);
            this.idPacientesRelacionados = this.paciente.relaciones.map(rel => {
                return { id: rel.referencia?.id || rel.referencia?._id || rel.referencia };
            });
            // notificamos cambios
            this.actualizar.emit({
                relaciones: this.paciente.relaciones,
                relacionesBorradas: this.relacionesBorradas
            });
        }
    }


    public onChange(data) {
        const index = this.paciente.relaciones.findIndex((rel: any) => (rel.referencia?.id || rel.referencia?._id || rel.referencia) === data.idRelacionado);
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
