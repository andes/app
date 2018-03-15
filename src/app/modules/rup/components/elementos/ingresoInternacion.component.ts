import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-ingresoInternacion',
    templateUrl: 'ingresoInternacion.html'
})
export class IngresoInternacionComponent extends RUPComponent implements OnInit {
    public ocupaciones = [];
    public obrasSociales = [];
    public origenHospitalizacion = [{ id: 'consultorio externo', nombre: 'Consultorio externo' },
    { id: 'emergencia', nombre: 'Emergencia' }, { id: 'traslado', nombre: 'Traslado' },
    { id: 'sala de parto', nombre: 'Sala de parto' }, { id: 'otro', nombre: 'Otro' }];
    public nivelesInstruccion = [{ id: 'primario incompleto', nombre: 'Primario incompleto' }, { id: 'primario completo', nombre: 'Primario completo' },
    { id: 'secundario incompleto', nombre: 'Secundario incompleto' }, { id: 'secundario completo', nombre: 'Secundario completo' },
    { id: 'Ciclo EGB (1 y 2) incompleto', nombre: 'Ciclo EGB (1 y 2) incompleto' },
    { id: 'Ciclo EGB (1 y 2) completo', nombre: 'Ciclo EGB (1 y 2) completo' },
    { id: 'Ciclo EGB 3 incompleto', nombre: 'Ciclo EGB 3 incompleto' },
    { id: 'Ciclo EGB 3 completo', nombre: 'Ciclo EGB 3 completo' },
    { id: 'Polimodal incompleto', nombre: 'Polimodal incompleto' },
    { id: 'Polimodal completo', nombre: 'Polimodal completo' },
    { id: 'terciario/universitario incompleto', nombre: 'Terciario/Universitario incompleto' },
    { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }];
    public situacionesLaborales = [{ id: 'Trabaja o está de licencia', nombre: 'Trabaja o está de licencia' },
    { id: 'No trabaja y busca trabajo', nombre: 'No trabaja y busca trabajo' },
    { id: 'No trabaja y no busca trabajo', nombre: 'No trabaja y no busca trabajo' }];
    public pacienteAsociado = [{ id: 'Obra Social', nombre: 'Obra Social' },
    { id: 'Plan de salud privado o Mutual', nombre: 'Plan de salud privado o Mutual' },
    { id: 'Plan o Seguro público', nombre: 'Plan o Seguro público' },
    { id: 'Mas de uno', nombre: 'Mas de uno' }, { id: 'Ninguno', nombre: 'Ninguno' }];


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeIngreso: {}
            };
        }

        // Cargamos todas las ocupaciones
        this.ocupacionService.get().subscribe(rta => {
            this.ocupaciones = rta;
        });

        // Se cargan los combos
        this.financiadorService.get().subscribe(resultado => {
            this.obrasSociales = resultado;
        });

    }
}
