import { Component, OnInit, Input } from '@angular/core';
import { HUDSService } from '../../services/huds.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';

@Component({
    selector: 'vista-accesos-huds',
    templateUrl: 'vista-accesos-huds.html'
})

export class VistaAccesosHudsComponent implements OnInit {
    @Input() paciente: IPaciente;

    constructor(
        private hudsService: HUDSService,
        public auth: Auth,
    ) { }

    public accesosHuds = [];
    public params;
    private scrollEnd = false;

    public columns = [
        {
            key: 'fechaAcceso',
            label: 'Fecha',
        },
        {
            key: 'nombreCompleto',
            label: 'Nombre Completo',
        },
        {
            key: 'motivo',
            label: 'Motivo',

        },
        {
            key: 'organizacion',
            label: 'Organización',

        }
    ];

    ngOnInit() {
        this.params = {
            paciente: this.paciente.id,
            skip: 0,
            limit: 15
        };
        // Si el usuario tiene restricción por efector solamente visualiza las prestaciones del efector el cual se
        // encuentra logueado, en caso contrario podra ver todas las prestaciones que tiene dicho paciente.
        if (this.auth.check('huds:efectorHuds')) {
            this.params['organizacion'] = this.auth.organizacion.id;
        }
        this.getAccesos();
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.getAccesos();
        }
    }

    getAccesos() {
        if (this.params.skip === 0) {
            this.accesosHuds = [];
        }
        this.hudsService.getAccesos(this.params).subscribe(accesos => {
            this.accesosHuds = this.accesosHuds.concat(accesos);
            this.params.skip = this.accesosHuds.length;
            // si vienen menos registros que la cantidad límite significa que ya se cargaron todos
            if (!accesos.length || accesos.length < this.params.limit) {
                this.scrollEnd = true;
            }
        });
    }
}
