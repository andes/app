import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
export class SolicitudPrestacionDefaultComponent extends Atomo implements OnInit {
    public profesionales: any[] = [];
    public copiaPofesionales: any[] = [];
    ngOnInit() {
        // debugger;
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            // if (this.data[this.elementoRUP.key].profesionales) {

            //     this.data[this.elementoRUP.key].profesionales.forEach(profesional => {
            //         delete profesional.$order;
            //         this.copiaPofesionales.push(profesional);
            //         console.log(profesional);

            //         // return {
            //         //     id: profesional.id,
            //         //     nombre: profesional.nombre,
            //         //     apellido: profesional.apellido,
            //         //     documento: profesional.documento
            //         // };
            //     });
            //     this.data[this.elementoRUP.key].profesionales = JSON.parse(JSON.stringify(this.copiaPofesionales));
            // }
            this.mensaje = this.getMensajes();
        } else {
            this.data[this.elementoRUP.key].autocitado = true;
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback(this.data[this.elementoRUP.key].profesionales);
            event.callback(this.quitarOrder());
        }

    }

    quitarOrder() {
        if (this.data[this.elementoRUP.key].profesionales) {
            this.data[this.elementoRUP.key].profesionales = [... this.data[this.elementoRUP.key].profesionales.map(profesional => {
                // delete profesional.$order;
                return {
                    id: profesional.id,
                    nombre: profesional.nombre,
                    apellido: profesional.apellido,
                    documento: profesional.documento
                };
            })];
            return this.data[this.elementoRUP.key].profesionales;
        }
        // console.log(this.data[this.elementoRUP.key]);
        // this.data[this.elementoRUP.key].profesionales = this.data[this.elementoRUP.key].profesionales.map(profesional => {
        //     return {
        //         id: profesional.id,
        //         nombre: profesional.nombre,
        //         apellido: profesional.apellido,
        //         documento: profesional.documento
        //     };
        // });
    }
}
