import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ICarpetaPaciente } from './../../../../interfaces/ICarpetaPaciente';
import { PacienteService } from './../../../../services/paciente.service';

@Component({
    selector: 'carpeta-paciente',
    templateUrl: 'carpeta-paciente.html'
})

export class CarpetaPacienteComponent implements OnInit {

    @Input() turnoSeleccionado: ITurno;
    @Output() guardarCarpetaEmit = new EventEmitter<boolean>();
    @Output() cancelarCarpetaEmit = new EventEmitter<boolean>();

    autorizado: any;
    permisosRequeridos = 'turnos:agenda:puedeEditarCarpeta';

    pacienteTurno: IPaciente;
    carpetaPaciente: any = null;

    constructor(public auth: Auth, public plex: Plex, public servicioPaciente: PacienteService) { }

    ngOnInit() {

        // Verificamos permiso para editar carpeta de un paciente
        this.autorizado = this.auth.check(this.permisosRequeridos);

        if (this.autorizado) {

            // Hay paciente?
            if (this.turnoSeleccionado.paciente.id) {
                // Traer las carpetas del paciente que haya en MPI
                this.servicioPaciente.getById(this.turnoSeleccionado.paciente.id).subscribe(paciente => {

                    if (paciente.carpetaEfectores.length > 0) {

                        // Filtramos y traemos sólo la carpeta de la organización actual
                        this.carpetaPaciente = paciente.carpetaEfectores.find(x => x.organizacion.id === this.auth.organizacion.id);

                    } else {
                        // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
                        this.servicioPaciente.getNroCarpeta({ documento: this.turnoSeleccionado.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpetaPaciente => {
                            this.carpetaPaciente = carpetaPaciente;
                        });
                    }

                });
            }
        };


    }

    guardarCarpetaPaciente() {

        if (this.carpetaPaciente !== null) {
            this.servicioPaciente.patch(this.turnoSeleccionado.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.carpetaPaciente }).subscribe(resultadoCarpeta => {

                this.guardarCarpetaEmit.emit(true);
            });
        }

    }

    cancelar() {
        this.cancelarCarpetaEmit.emit(true);
    }

}
