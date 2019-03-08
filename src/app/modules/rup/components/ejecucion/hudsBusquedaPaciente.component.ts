import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'rup-hudsBusquedaPaciente',
    templateUrl: 'hudsBusquedaPaciente.html',
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaPacienteComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    public paciente: IPaciente;

    public showHuds = false;

    public esProfesional = false;
    // ---- Variables asociadas a componentes paciente buscar y paciente listado
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;


    constructor(public plex: Plex, public auth: Auth, private router: Router) { }

    ngOnInit() {
        if (!this.auth.profesional && this.auth.getPermissions('huds:?').length <= 0) {
            this.redirect('inicio');
        }

        if (this.auth.profesional) {
            this.esProfesional = true;
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }



    onPacienteCancel() {
        this.router.navigate(['rup']);
    }

    evtCambiaPaciente() {
        this.showHuds = false;
    }

    // -------------- SOBRE BUSCADOR PACIENTES ----------------

    searchStart() {
        this.paciente = null;
        this.loading = true;
    }

    searchEnd(resultado) {
        this.loading = false;
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
        this.paciente = null;
    }

    // ----------------------------------

    // Componente paciente-listado

    onSelect(paciente: IPaciente): void {
        this.resultadoBusqueda = [];
        // Es un paciente existente en ANDES??
        if (paciente && paciente.id) {
            this.paciente = paciente;
            this.showHuds = true;

        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
    }
    // ----------------------------------
}
