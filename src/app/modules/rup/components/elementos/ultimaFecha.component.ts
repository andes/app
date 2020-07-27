import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-ultima-fecha',
    templateUrl: 'ultimaFecha.html'
})
@RupElement('UltimaFechaComponent')
export class UltimaFechaComponent extends RUPComponent implements OnInit {
    public alerta: any;
    ultimaConsulta: any;
    validacion = false;
    min = new Date();
    max = new Date();

    ngOnInit() {

        this.min = this.paciente.fechaNacimiento;
        this.max = moment(this.prestacion.ejecucion.fecha).endOf('day').toDate();

        if (!this.soloValores) {
            // Observa cuando cambia la propiedad en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {

                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
        this.route.url.subscribe(urlParts => {
            if (urlParts.length > 1) {
                this.validacion = urlParts[1].path === 'validacion';
            }
        });

        this.calculaTiempo();
        if (!this.validacion && !this.soloValores && !this.registro.valor) {
            const query = (this.params && this.params.query) || this.registro.concepto.conceptId;
            this.prestacionesService.getRegistrosHuds(this.paciente.id, query).subscribe((prestaciones: any[]) => {

                prestaciones = prestaciones.sort((a, b) => {
                    let dateA = a.fecha.getTime();
                    let dateB = b.fecha.getTime();
                    return dateA <= dateB ? 1 : -1;
                });
                if (prestaciones.length > 0) {
                    const valor = prestaciones[0].registro.valor;
                    if (valor && valor.toUTCString) { // Para chequear que sea una Date
                        this.registro.valor = this.min = valor;

                    } else {
                        this.registro.valor = this.min = prestaciones[0].fecha;
                    }
                    this.calculaTiempo();
                }
            });
        }
    }

    calculaTiempo() {
        if (this.registro.valor) {
            const tiempo = new Date(this.max.getTime() - this.registro.valor.getTime());
            const dateStrArray = [];
            let bandera = false;

            const anios = tiempo.getUTCFullYear() - 1970;
            if (anios > 0) {
                dateStrArray.push(`${anios} año${anios > 1 ? 's' : ''}`);
                bandera = true;
            }

            const meses = tiempo.getUTCMonth();
            if (meses > 0) {
                dateStrArray.push(`${meses} mes${meses > 1 ? 'es' : ''}`);
                bandera = true;
            }

            const dias = tiempo.getUTCDate() - 1;
            if (dias > 0) {
                dateStrArray.push(`${dias} dia${dias > 1 ? 's' : ''}`);
                bandera = true;
            }
            // Reemplaza la ultima coma por un "y"
            if (bandera) {
                this.alerta = `Han pasado ${dateStrArray.join(', ').replace(/(\b, \b)(?!.*\1)/, ' y ')}`;
                bandera = false;
            } else {
                this.alerta = '';
            }
        }
    }

    onChange() {
        this.emitChange();
        this.calculaTiempo();
    }
    get DateFormat() {
        switch (this.params.type) {
            case 'date':
                return moment(this.registro.valor).format('DD/MM/YYYY');
            case 'datetime':
                return moment(this.registro.valor).format('DD/MM/YYYY hh:mm');
            case 'time':
                return moment(this.registro.valor).format('hh:mm');
            default:
                break;
        }
    }
}
