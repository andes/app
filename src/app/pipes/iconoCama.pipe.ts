import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
@Pipe({ name: 'iconoCama'})
export class IconoCamaPipe implements PipeTransform {
    transform(persona: any, args: string[]): any {
        /*
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difD: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(value.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'años'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'meses'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'días'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'horas'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minutos'
            };
        }
        */

        console.log("entramos a iconoCama");
        console.log(persona);
        let edad;
        if (persona.fechaNacimiento) {
            let birthDate = new Date(persona.fechaNacimiento);
            let otherDate = new Date();
            let years = (otherDate.getFullYear() - birthDate.getFullYear());
            if (otherDate.getMonth() < birthDate.getMonth() ||
                otherDate.getMonth() === birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
                years--;
            }

            edad = years;
        } else {
            edad = null;
        }

        if (edad >= 0 && edad < 15) {
            if (edad >= 0 && edad <= 3) {
                return 'mdi mdi-baby';
            } else if (edad > 3 && edad < 15) {
                return 'mdi mdi-human-child';
            }
        } else {
            if (persona.sexo && (persona.sexo === 'Masculino' || persona.sexo === 'masculino')) {
                return 'mdi mdi-human-male';
            } else if (persona.sexo && (persona.sexo === 'Femenino' || persona.sexo === 'femenino')) {
                return 'mdi mdi-human-female';
            } else if (persona.sexo && (persona.sexo === 'Indeterminado' || persona.sexo === 'indeterminado')) {
                return 'mdi mdi-circle-outline';
            }
        }

        return 'mdi mdi-human-male';
    }
}

