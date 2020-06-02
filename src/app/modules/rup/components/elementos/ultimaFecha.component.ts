import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { isNullOrUndefined } from 'util';
@Component({
    selector: 'rup-ultima-fecha',
    templateUrl: 'ultimaFecha.html'
})
@RupElement('UltimaFechaComponent')
export class UltimaFechaComponent extends RUPComponent implements OnInit {
    public alerta: any;
    consultasValidadas: any;
    ultimaConsulta: any;
    ultimaConsultaIndex: number;
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
        this.registro.valido = true;
        let params: any = {
            idPaciente: this.paciente.id,
            ordenFecha: true,
            estado: 'validada'
        };
        this.ultimaConsultaIndex = 0;

        // Nos aseguramos que NO estamos en la pantalla de Validación/Resumen

        if (!this.validacion && !this.soloValores && !this.registro.valor) {

            // Se busca en la HUDS si hay prestaciones con valores ya cargados
            this.prestacionesService.get(params).subscribe(consultasPaciente => {

                // Se da vuelta el array, para que quede el último registro en la última posición del array (length - 1)
                this.consultasValidadas = consultasPaciente;

                // Hay registros anteriores en la HUDS?
                if (this.consultasValidadas && this.consultasValidadas.length > 0) {

                    // Se busca la ultima consulta en la que hubo registro
                    while (this.ultimaConsultaIndex < this.consultasValidadas.length && !this.ultimaConsulta) {
                        this.ultimaConsulta = this.consultasValidadas[this.ultimaConsultaIndex].ejecucion.registros.find(x =>
                            x.concepto.conceptId === this.registro.concepto.conceptId);

                        this.ultimaConsultaIndex++;
                    }

                    // Si se encontro consulta se guardan registros
                    if (this.ultimaConsulta ) {
                        this.registro.valor = this.ultimaConsulta.valor;
                        this.calculaTiempo();
                        this.min = this.registro.valor;
                    }

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
