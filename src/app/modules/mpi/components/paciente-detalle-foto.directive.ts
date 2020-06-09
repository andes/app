import { Directive, ElementRef, Input } from '@angular/core';
import { AdjuntosService } from '../../rup/services/adjuntos.service';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { environment } from '../../../../environments/environment';

// "http://localhost:3002/api/core/mpi/pacientes/{{paciente.id}}/foto?token={{token}}"

@Directive({
    selector: '[mpiFotoPaciente]'
})
export class FotoDirective {
    @Input() set mpiFotoPaciente(paciente: IPaciente) {
        if (paciente && paciente.id) {
            this.fileService.token$.subscribe((data: any) => {
                const { token } = data;
                const url = `${environment.API}/core-v2/mpi/paciente/${paciente.id}/foto?token=${token}`;
                this.el.nativeElement.src = url;
            });
        }
    }

    constructor(
        private el: ElementRef,
        private fileService: AdjuntosService
    ) { }
}
