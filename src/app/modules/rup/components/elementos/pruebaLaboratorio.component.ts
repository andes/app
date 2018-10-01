import { PracticaService } from './../../../../services/laboratorio/practica.service';
import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as enumerados from './../../../../utils/enumerados';
import { IPracticaMatch } from './../../../../components/laboratorio/interfaces/IPracticaMatch.inteface';
import { PracticaBuscarResultado } from './../../../../components/laboratorio/interfaces/PracticaBuscarResultado.inteface';
import { IPractica } from './../../../../interfaces/laboratorio/IPractica';

@Component({
    selector: 'rup-pruebaLaboratorio',
    templateUrl: 'pruebaLaboratorio.html'
})
export class PruebaLaboratorioComponent extends RUPComponent implements OnInit {
    // Tipos de Prestaciones a las que el usuario tiene permiso
    public tiposPrestacion: any = [];
    public prestacionSeleccion;
    public practicas: IPracticaMatch[] | IPractica[];
    public practicasActivas = [];
    public darTurnoEmit = new EventEmitter<any>();
    @Output() busquedaFinal: EventEmitter<PracticaBuscarResultado> = new EventEmitter<PracticaBuscarResultado>();

    ngOnInit() {
        // Buscamos los tipos de prestación que sean turneables para los que el tenga permisos
        // (OBS: a futuro un profesional puede tener permisos para más Prestaciones que no sean turneables)
        if (!this.registro.valor) {
            this.registro.valor = {
                solicitudPrestacion: {}
            };
            this.registro.valor.solicitudPrestacion['autocitado'] = false;
            // this.registro.valor.solicitudPrestacion['prestacionSolicitada'] = this.tiposPrestacion.find(tp => tp.conceptId === this.registro.concepto.conceptId);

            this.registro.valor.solicitudPrestacion['prestacionSolicitada'] = this.tiposPrestacion.find(tp => tp.conceptId === this.prestacion.solicitud.tipoPrestacion.conceptId);

        }

    }
    busquedaInicial() {
        this.practicas = null;
    }
    searchClear() {
        this.practicas = null;
    }





    seleccionarPractica(practica: IPractica) {
        let existe = this.practicasActivas.findIndex(x => x.id === practica.id);

        if (existe === -1) {

            this.practicasActivas.push(practica);

        }

        console.log(this.practicasActivas);


    }
    loadPrioridad(event) {
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();

    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            let callback = (this.registro.valor.solicitudPrestacion.organizacionDestino) ? this.registro.valor.solicitudPrestacion.organizacionDestino : null;
            event.callback(callback);
        }
    }

    loadServicios(event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            let servicioEnum = organizacion.unidadesOrganizativas;
            console.log(servicioEnum);
            event.callback(servicioEnum);
        });

    }

    loadPracticas(event) {
        if (event.query) {
            let query = {
                cadenaInput: event.query
            };
            this.servicioPractica.getMatch(query).subscribe(resultado => {
                event.callback(resultado);
            });
        }
    }
}











