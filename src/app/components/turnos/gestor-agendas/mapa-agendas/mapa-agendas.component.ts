import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';

@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {


    public parametros;


    public prestacionesPermisos;
    public verDia = false;
    public verMes = false;
    public diaInicio = new Date();
    public dataF;
    public verSemana = true;
    constructor(

        private auth: Auth,
        private conceptoTurneablesService: ConceptosTurneablesService,
        private router: Router

    ) { }

    ngOnInit() {
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

        if (!this.prestacionesPermisos.length) {
            this.router.navigate(['inicio']);
        }


        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        this.conceptoTurneablesService.getAll().subscribe((data) => {
            if (this.prestacionesPermisos[0] === '*') {
                this.dataF = data;
            } else {
                this.dataF = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
            }
        });
    }



    private visualizarDia(event?) {
        if (event) {
            this.verDia = true;
            this.verSemana = false;
            this.verMes = false;
            this.diaInicio = moment(event);
        }
        this.verDia = true;
        this.verSemana = false;
        this.verMes = false;
        this.diaInicio = moment(this.diaInicio);
    }

    private visualizarSemana() {
        this.verSemana = true;
        this.verDia = false;
        this.verMes = false;
        this.diaInicio = moment(this.diaInicio);
    }

    private visualizarMes() {
        this.verDia = false;
        this.verSemana = false;
        this.diaInicio = moment(this.diaInicio);
        this.verMes = true;
    }
}
