import { SnomedService } from '../../../../services/term/snomed.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-ActividadNoNominalizada',
    templateUrl: 'informeActividadNoNominalizada.html'
})
export class InformeActividadNoNominalizadaComponent extends RUPComponent implements OnInit {

    public elegirOtraActividad = false;
    public tematicas = [
        { id: 'Adicciones', nombre: 'Adicciones' },
        { id: 'Adolescencia', nombre: 'Adolescencia' },
        { id: 'Adulto mayor', nombre: 'Adulto mayor' },
        { id: 'Alimentación', nombre: 'Alimentación' },
        { id: 'Crianza', nombre: 'Crianza' },
        { id: 'Embarazo, parto y puerperio', nombre: 'Embarazo, parto y puerperio' },
        { id: 'Emergencias / Urgencias', nombre: 'Emergencias / Urgencias' },
        { id: 'Enfermedades crónicas no transmisibles', nombre: 'Enfermedades crónicas no transmisibles' },
        { id: 'Enfermedades infecciosas', nombre: 'Enfermedades infecciosas' },
        { id: 'Epidemiología / Estadística', nombre: 'Epidemiología / Estadística' },
        { id: 'Hábitos saludables', nombre: 'Hábitos saludables' },
        { id: 'Lactancia', nombre: 'Lactancia' },
        { id: 'Salud escolar', nombre: 'Salud escolar' },
        { id: 'Salud mental', nombre: 'Salud mental' },
        { id: 'Salud sexual y reproductiva', nombre: 'Salud sexual y reproductiva' },
        { id: 'Violencia', nombre: 'Violencia' },
        { id: 'Otra', nombre: 'Otra' }];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                informe: {}
            };
        }

    }

    loadProfesionales(event) {
        if (event && event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            let callback = (this.registro.valor.informe.profesionales) ? this.registro.valor.infrome.profesionales : null;
            event.callback(callback);
        }
    }

    loadActividades($event) {
        this.snomedService.getQuery({ expression: '^2051000013106' }).subscribe(result => {
            $event.callback(result);
        });
    }

    mostrarOtraTematica() {
        if (this.registro.valor.informe.tematica) {
            this.registro.valor.informe.tematica = ((typeof this.registro.valor.informe.tematica === 'string')) ? this.registro.valor.informe.tematica : (Object(this.registro.valor.informe.tematica).id);
            this.elegirOtraActividad = this.registro.valor.informe.tematica === 'Otra';
        }
    }

}
