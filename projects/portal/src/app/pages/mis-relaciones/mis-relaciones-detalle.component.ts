import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacientePortalService } from '../../services/paciente-portal.service';
import { Auth } from '@andes/auth';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'pdp-mis-relaciones-detalle',
    templateUrl: './mis-relaciones-detalle.component.html'
})
export class PDPMisRelacionesDetalleComponent implements OnInit {

    public selectedId;
    public prestaciones$;
    public familiar: IPaciente;

    constructor(
        private activeRoute: ActivatedRoute,
        private pacienteService: PacientePortalService,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.activeRoute.paramMap.pipe(
            map(resp => resp.get('id')),
            switchMap((idFamiliar: string) => {
                return this.pacienteService.getFamiliar(idFamiliar).pipe(
                    map(data => this.familiar = data)
                );
            })
        ).subscribe();
    }

    get vinculoFamiliar() {
        const userId = this.auth.mobileUser?.pacientes[0].id;
        return this.familiar.relaciones.find(f => f.referencia === userId).relacion.opuesto;
    }

}
