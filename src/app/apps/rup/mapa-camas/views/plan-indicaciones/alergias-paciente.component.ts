import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';

@Component ({
    selector: 'alergias-paciente',
    templateUrl: './alergias-paciente.html',
    styles: [`
        .bordered {
            width: 175px;
            height: 36px;
            border: #ff8d22 solid 1px;
        }
    `]
})
export class AlergiasPacienteComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() cardSize: 'half' | 'full' = 'half';

    public registrosAlergia$: Observable<any[]>;
    private expression = '<<39579001 OR <<419199007';

    constructor(
        private prestacionesService: PrestacionesService
    ) {}

    ngOnInit() {
        this.registrosAlergia$ = this.prestacionesService.getRegistrosHuds(this.paciente.id, this.expression, null, null, null, 'inferred').pipe(
            map(alergias => alergias.map(a => {
                return {
                    nombre: a.registro.nombre,
                    evolucion: a.registro.valor.evolucion?.replace(/<[/]*p>/gi, ' '),
                    fechaInicio: a.registro.valor.fechaInicio
                };
            })
            )
        );
    }
}
