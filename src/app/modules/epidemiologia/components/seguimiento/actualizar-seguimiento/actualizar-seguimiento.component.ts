import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SeguimientoPacientesService } from '../../../services/seguimiento-pacientes.service';

@Component({
    selector: 'actualizar-seguimiento',
    templateUrl: './actualizar-seguimiento.html',
})
export class ActualizarSeguimientoComponent implements OnInit {
    @Input() seguimiento;
    @Output() close: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    editContactos;
    scoreValue;
    esAuditor;

    constructor(
        private auth: Auth,
        private plex: Plex,
        private seguimientoPacientesService: SeguimientoPacientesService
    ) { }

    ngOnInit() {
        this.scoreValue = this.seguimiento.score.value;
        this.esAuditor = this.auth.check('epidemiologia:seguimiento:auditoria');
    }

    guardar() {
        const data: any = {
            organizacionSeguimiento: this.seguimiento.organizacionSeguimiento,
            contactosEstrechos: this.seguimiento.contactosEstrechos
        };

        if (this.scoreValue !== this.seguimiento.score.value) {
            data.score = {
                value: this.scoreValue,
                fecha: new Date()
            };
        }

        this.seguimientoPacientesService.update(this.seguimiento.id, data).subscribe(() => {
            this.plex.toast('success', 'La derivación fue actualizada exitosamente');
            this.save.emit(false);
        });
    }

    changePriority(event) {
        this.scoreValue = event?.id;
    }

    cerrar() {
        this.close.emit(false);
    }

    hideSubmit($event) {
        this.editContactos = $event;
    }
}
