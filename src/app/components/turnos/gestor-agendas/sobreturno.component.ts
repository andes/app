import { Component, Input, EventEmitter, Output, OnInit, HostBinding, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IPaciente } from './../../../interfaces/IPaciente';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { patientFullNamePipe } from './../../../utils/patientPipe';



@Component({
    selector: 'sobreturno',
    templateUrl: 'sobreturno.html'
})

export class AgregarSobreturnoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    private _agenda: any;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();

    showAgregarSobreturno = true;
    showSobreturno = true;

    public modelo: any;
    public resultado: any;
    public paciente: IPaciente;
    pacientesSearch = false;
    pacienteNombre: String = '';
    tipoPrestaciones: any[];
    horaTurno = null;

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioTipoPrestacion: TipoPrestacionService, private router: Router, public auth: Auth) { }

    ngOnInit() {
    }

    buscarPaciente() {
        this.showSobreturno = false;
        this.pacientesSearch = true;
    }

    onReturn(paciente: IPaciente): void {
        if (paciente.id) {
            this.paciente = paciente;
            // new patientRealAgePipe().transform(this.paciente, []);
            this.pacienteNombre = new patientFullNamePipe().transform(paciente, []);
            // this.verificarTelefono(this.paciente);
            this.showSobreturno = true;
            this.pacientesSearch = false;
            window.setTimeout(() => this.pacientesSearch = false, 100);
        }
        // else {
        //     this.seleccion = pacientes;
        //     // this.verificarTelefono(this.seleccion);
        //     this.esEscaneado = true;
        //     this.escaneado.emit(this.esEscaneado);
        //     this.selected.emit(this.seleccion);
        //     this.pacientesSearch = false;
        //     this.showCreateUpdate = true;
        // }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF = data.filter((x) => { return this.auth.check('turnos:planificarAgenda:prestacion:' + x.id); });
            event.callback(dataF);
            // this.tipoPrestaciones = dataF;
        });
    }

    guardar() {
        // let alertCount = 0;
        // this.agendasSeleccionadas.forEach((agenda, index) => {
        //     let patch = {
        //         'op': 'notaAgenda',
        //         // 'nota': agenda.nota
        //         'nota': this.nota
        //     };

        //     this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
        //         if (alertCount === 0) {
        //             if (this.agendasSeleccionadas.length === 1) {
        //                 this.plex.toast('success', 'La Nota se guardó correctamente');
        //             } else {
        //                 this.plex.toast('success', 'Las Notas se guardaron correctamente');
        //             }
        //             alertCount++;
        //         }

        //         agenda = resultado;
        //         if (index === this.agendasSeleccionadas.length - 1) {
        //             this.saveAgregarNotaAgenda.emit(agenda);
        //         }
        //     },
        //         err => {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         });

        // });
    }

    cancelar() {
        console.log('aca');
        this.volverAlGestor.emit(true);
    }
}
