import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { PacienteService } from '../../core/mpi/services/paciente.service';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';
import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';

@Component({
    selector: 'carpeta-paciente',
    templateUrl: 'carpeta-paciente.html',
    styles: [`
        .invert .default {background: transparent !important; color: white;}
        .fondoNegro { background-color: #002738 !important; color: white;}
        .btnEdit {margin-top: 0.5em; margin-left: 0.5em; margin-right: 0.5em;}
    `]
})

export class CarpetaPacienteComponent implements OnInit {

    /**
     * Este flag esta agregado para mantener compatibilidad con todos
     * PERO debería desaparecer cuando las componentes que usan <carpeta-paciente> se adapten.
     */
    @Input() emitOnNew = false;

    @Input() turnoSeleccionado: ITurno;
    @Input() pacienteSeleccionado: IPaciente;
    @Output() guardarCarpetaEmit = new EventEmitter<any>();
    @Output() cancelarCarpetaEmit = new EventEmitter<boolean>();

    idOrganizacion = this.auth.organizacion.id;
    indiceCarpeta = -1;
    carpetaEfectores = [];
    nroCarpetaOriginal: string;
    showList = true;
    showNuevaCarpeta = false;
    autorizado = false;
    permisosRequeridos = 'turnos:puntoInicio:puedeEditarCarpeta';
    carpetaPaciente: any;
    paciente: any;
    showEdit = false;
    nroCarpetaSugerido: string;
    nuevoNroCarpeta: string;
    public editarCarpeta = false;
    constructor(
        public auth: Auth,
        public plex: Plex,
        public servicioPaciente: PacienteService,
        public servicioCarpetaPaciente: CarpetaPacienteService) { }

    ngOnInit() {
        // Verificamos permiso para editar carpeta de un paciente
        this.autorizado = this.auth.check(this.permisosRequeridos);
        this.editarCarpeta = this.auth.getPermissions('turnos:agenda:puedeEditarCarpeta:?').length > 0;
        this.carpetaPaciente = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        // Hay paciente?
        if (this.turnoSeleccionado && this.turnoSeleccionado.paciente.id) {
            this.paciente = this.turnoSeleccionado.paciente;
            // Obtenemos el paciente completo. (entró por parametro el turno)
            this.servicioPaciente.getById(this.paciente.id).subscribe(resultado => {
                this.paciente = resultado;
                this.getCarpetas(this.paciente);
            });
        } else {
            if (this.pacienteSeleccionado) {
                // entró paciente por parámetro, no hace falta hacer otro get paciente.
                this.paciente = this.pacienteSeleccionado;
                this.getCarpetas(this.paciente);
            } else {
                this.plex.info('warning', 'No hay ningún paciente seleccinado', 'Error obteniendo carpetas');
            }
        }
    }

    private getCarpetas(paciente) {
        if (paciente && paciente.carpetaEfectores && paciente.carpetaEfectores.length > 0) { // este paciente tiene carpetas?
            // Filtramos y traemos sólo la carpeta de la organización actual
            this.carpetaEfectores = paciente.carpetaEfectores;
            let result = paciente.carpetaEfectores.find((elemento, indice) => {
                let resultado = (elemento.organizacion as any)._id === this.auth.organizacion.id;
                if (resultado) {
                    this.indiceCarpeta = indice;
                }
                return resultado;
            });
            if (result) { // se encontró una carpeta existente?
                this.carpetaPaciente = result;
            }
            this.nroCarpetaOriginal = this.carpetaPaciente.nroCarpeta;

        }
        if (this.indiceCarpeta === -1) { // buscamos en la colección de carpetas importadas desde SIPS
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicioCarpetaPaciente.getNroCarpeta({ documento: paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                // Si la carpeta en carpetaPaciente tiene una longitud mayor a 0, se filtra por organización para obtener nroCarpeta.
                if (carpeta.length > 0) {
                    let carpetaE = carpeta[0].carpetaEfectores.find((carpetaEf: any) => carpetaEf.organizacion._id === this.auth.organizacion.id);
                    if (carpetaE.nroCarpeta) {
                        this.carpetaPaciente = carpetaE;
                        this.nroCarpetaOriginal = this.carpetaPaciente.nroCarpeta;
                        this.carpetaEfectores.push(this.carpetaPaciente);
                        this.indiceCarpeta = this.carpetaEfectores.length - 1;
                        // Cuando se encontro una carpeta de la coleccion y no se inpacto en el paciente notifico como si fuese un cambio
                        if (this.emitOnNew) {
                            // Debería Guardar la carpeta en paciente. Queda para revisar.
                            this.guardarCarpetaEmit.emit([carpetaE]);
                        }
                    }
                    if (!this.carpetaPaciente || this.carpetaPaciente.nroCarpeta === '') {
                        this.showNuevaCarpeta = true;
                        this.servicioCarpetaPaciente.getSiguienteCarpeta().subscribe((sugerenciaCarpeta: string) => {
                            this.nroCarpetaSugerido = '' + sugerenciaCarpeta;
                        });
                    }
                } else {
                    this.showNuevaCarpeta = true;
                }
            });
        }
    }


    guardarCarpetaPaciente(nuevaCarpeta = false) {
        if (this.autorizado && this.nuevoNroCarpeta) {
            if (this.nuevoNroCarpeta.toString() === this.carpetaPaciente.nroCarpeta) {
                this.plex.toast('danger', 'El número de carpeta ya existe');
            } else {
                this.carpetaPaciente.nroCarpeta = this.nuevoNroCarpeta.toString().trim();
                if (this.indiceCarpeta > -1) {
                    this.carpetaEfectores[this.indiceCarpeta] = this.carpetaPaciente;
                } else {
                    this.carpetaEfectores.push(this.carpetaPaciente);
                    this.indiceCarpeta = this.carpetaEfectores.length - 1;
                }
                this.servicioPaciente.patch(this.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.carpetaEfectores }).subscribe(
                    resultadoCarpeta => {
                        this.guardarCarpetaEmit.emit(this.carpetaEfectores);
                        this.plex.toast('success', 'Nuevo número de carpeta establecido');
                        this.nroCarpetaOriginal = this.carpetaPaciente.nroCarpeta;
                        this.showNuevaCarpeta = false;
                        if (nuevaCarpeta) {
                            this.servicioCarpetaPaciente.incrementarNroCarpeta().subscribe();
                        }
                    },
                    error => {
                        this.plex.toast('danger', 'El número de carpeta ya existe');
                        if (this.indiceCarpeta < 0) {
                            this.carpetaEfectores.pop();
                        }
                        this.carpetaPaciente.nroCarpeta = this.nroCarpetaOriginal;
                    }
                );
            }
        } else {
            this.plex.info('warning', '', 'Ingrese un número de carpeta válido');
            this.carpetaPaciente.nroCarpeta = this.nroCarpetaOriginal;
            this.guardarCarpetaEmit.emit(false);
            this.nuevoNroCarpeta = '';
        }
        this.showEdit = false;
        this.showList = true;
    }

    cancelar() {
        this.carpetaPaciente.nroCarpeta = '';
        this.cancelarCarpetaEmit.emit(true);
        this.showList = true;
    }

    cerrarEdicion() {
        this.showEdit = false;
        this.guardarCarpetaEmit.emit(false);
    }

    editar() {
        this.nuevoNroCarpeta = this.carpetaPaciente.nroCarpeta;
        this.showEdit = true;
    }

    crearCarpetaPaciente() {
        this.showList = false;
        this.carpetaPaciente.nroCarpeta = this.nroCarpetaSugerido;
    }
}
