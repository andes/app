import { Component, Input, EventEmitter, Output, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { PacienteService } from './../../../../services/paciente.service';
// import * as jsPDF from 'jspdf';
import * as moment from 'moment';

@Component({
    selector: 'listar-turnos',
    templateUrl: 'listar-turnos.html',
    styleUrls: ['listar-turnos.print.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})

export class ListarTurnosComponent implements OnInit {

    private _agenda;
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        let turnos;
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            turnos = this.agenda.bloques[i].turnos;
            this.turnosAsignados = (this.agenda.bloques[i].turnos).filter((turno) => { return turno.estado === 'asignado'; });
            for (let t = 0; t < this.turnosAsignados.length; t++) {
                // let params = { documento: this.turnos[t].paciente.documento, organizacion: this.auth.organizacion.id };
                this.servicePaciente.getById(this.turnosAsignados[t].paciente.id).subscribe((paciente) => {
                    if (paciente && paciente.carpetaEfectores) {
                        let carpetaEfector = null;
                        carpetaEfector = paciente.carpetaEfectores.filter((data) => {
                            return (data.organizacion.id === this.auth.organizacion.id);
                        });
                        this.turnosAsignados[t].paciente = paciente;
                        this.turnosAsignados[t].paciente.carpetaEfectores = carpetaEfector;
                    }
                });
            }
        }
    }
    get agenda(): any {
        return this._agenda;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @HostBinding('class.plex-layout') layout = true;

    showListarTurnos = true;
    turnosAsignados = [];

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicePaciente: PacienteService, public auth: Auth) { }

    ngOnInit() {

    }

    /*
    * Volver al gestor
    */
    cancelar() {
        this.volverAlGestor.emit(true);
        this.showListarTurnos = false;
    }


    // Version con JS PDF
    // imprimirPdf(agenda) {
    //     let doc = new jsPDF({ orientation: 'landscape' });
    //     doc.setFontSize(10);
    //     doc.text(20, 20, 'Establecimiento: ');
    //     doc.text(60, 20, agenda.organizacion.nombre);
    //     doc.text(20, 25, 'Apellido y Nombre: ');
    //     let linea = 25;
    //     if (agenda.profesionales) {
    //         agenda.profesionales.forEach(profesional => {
    //             doc.text(60, linea, profesional.apellido + ' ' + profesional.nombre);
    //             linea = linea + 5;
    //         });
    //     }
    //     linea = linea + 5;
    //     doc.text(20, linea, 'Prestacion: ');
    //     if (agenda.tipoPrestaciones) {
    //         agenda.tipoPrestaciones.forEach(prestacion => {
    //             doc.text(60, linea, prestacion.nombre);
    //             linea = linea + 5;
    //         });
    //     }
    //     doc.text(20, linea, 'Fecha: ');
    //     doc.text(60, linea, moment(agenda.horaInicio).format('DD/MM/YYYY'));
    //     linea = linea + 5;
    //     doc.line(20, linea, 300, linea);
    //     linea = linea + 10;
    //     // Encabezado
    //     doc.text(20, linea, 'Hora Turno');
    //     doc.text(25, linea, 'DNI/Carpeta');
    //     doc.text(35, linea, 'OBRA SOCIAL');
    //     doc.text(45, linea, 'APELLIDOS Y NOMBRES');
    //     // Se guarda el pdf
    //     doc.save('agenda.pdf');

    // }


}
