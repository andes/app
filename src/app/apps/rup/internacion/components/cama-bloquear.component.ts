import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICama } from '../interfaces/ICama';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { CamasService } from '../services/camas.service';

@Component({
    selector: 'cama-bloquear',
    templateUrl: 'cama-bloquear.html'
})
export class CamaBloquearComponent implements OnInit {

    public fecha = new Date();
    public hora = new Date();

    // cama sobre la que estamos trabajando
    @Input() cama: ICama;

    // resultado de la accion realizada sobre la cama
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();

    // lista de los motivos del bloque, luego los va a traer desde snomed
    public listaMotivosBloqueo = [{ id: 'Bolqueo', name: 'Bloqueo' }, { id: 'Falta de personal', name: 'Falta de personal' }, { id: 'Se envia a reparar', name: 'Se envia a reparar' }];

    constructor(private plex: Plex, private internacionService: InternacionService, private camasService: CamasService) { }

    ngOnInit() { }

    public bloquearCama(event) {
        if (event.formValid) {
            let dto = {
                fecha: this.internacionService.combinarFechas(this.fecha, this.hora),
                estado: 'bloqueada',
                unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                esCensable: this.cama.ultimoEstado.esCensable,
                genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                paciente: this.cama.ultimoEstado.paciente ? this.cama.ultimoEstado.paciente : null,
                idInternacion: this.cama.ultimoEstado.idInternacion ? this.cama.ultimoEstado.idInternacion : null,
                esMovimiento: false
            };
            this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                this.accionCama.emit({ cama: this.cama, accion: 'bloquearCama' });
            }, (err) => {
                this.plex.info('danger', err, 'Error');
            });
        }
    }


    cancelar() {
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

}
