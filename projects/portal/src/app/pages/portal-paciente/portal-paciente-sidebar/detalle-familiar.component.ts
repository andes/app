import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacientePortalService } from '../../../services/paciente-portal.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';

@Component({
    selector: 'pdp-detalle-familiar',
    templateUrl: './detalle-familiar.html',
})
export class DetalleFamiliarComponent implements OnInit {

    public selectedId;
    public prestaciones$;
    private idFamiliar;
    public familiar: IPaciente;

    constructor(
        private pacienteService: PacientePortalService,
        private route: ActivatedRoute,
        private auth: Auth
    ) { }

    get vinculoFamiliar() {
        const userId = this.auth.mobileUser?.pacientes[0].id;
        return this.familiar.relaciones.find(f => f.referencia === userId).relacion.opuesto;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idFamiliar = params['id'];
            this.pacienteService.getFamiliar(this.idFamiliar).subscribe(data => this.familiar = data);
        });
    }

}
