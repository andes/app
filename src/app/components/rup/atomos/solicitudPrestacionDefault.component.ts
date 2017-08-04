import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
export class SolicitudPrestacionDefaultComponent extends Atomo implements OnInit {
    private listaPlanes: any = [];

    public puedeAutocitar: Boolean = false;

    ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};

        // obtenemos todos los planes
        this.servicioTipoPrestacion.get({}).subscribe(planes => {
            this.listaPlanes = planes;

            // buscamos el concepto turneable al cual pertenece el concepto a cargar
            let conceptoTurneable = planes.find(plan => (plan.conceptId === this.snomedConcept.conceptId) );

            // verificamos si tenemos permisos sobre ese concepto
            let tienePermisos = this.auth.getPermissions('rup:tipoPrestacion:?').find(permiso => permiso === conceptoTurneable.id);

            if (tienePermisos) {
                this.puedeAutocitar = true;
            }

            // si tengo valores cargados entonces devuelvo los resultados y mensajes
            if (this.datosIngreso) {

                this.mensaje = this.getMensajes();
            } else {
                this.data[this.elementoRUP.key].autocitado = true;
            }
        });

    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            let callback = (this.data[this.elementoRUP.key].profesionales) ? this.data[this.elementoRUP.key].profesionales : null;
            // let profesionales = {};

            // if (this.data[this.elementoRUP.key].profesionales) {
            //     this.quitarOrder();
            //     profesionales = JSON.parse(JSON.stringify(this.data[this.elementoRUP.key].profesionales));
            // }

            // event.callback(profesionales);

            // event.callback(this.data[this.elementoRUP.key].profesionales);
            event.callback(callback);
        }

    }

    cambioAutocitado() {
        // si cambio autocitado y lo puse en false, entonces limpio los profesionales
        if (!this.data[this.elementoRUP.key].autocitado) {
            this.data[this.elementoRUP.key].profesionales = null;
        }

        // emitimos los valores
        this.devolverValores();
    }
}
