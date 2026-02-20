import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { SnomedService } from '../../apps/mitos';


@Component({
    selector: 'app-addFormTerapeutico',
    templateUrl: './add-form-terapeutico.html'
})
export class AddformTerapeuticoComponent {
    @HostBinding('class.plex-layout') layout = true;
    @Input() indice: any;
    @Input() deep: number;
    public detalleMedicamento: any;
    public datosParaAgregar = {
        concepto: null,
        indicaciones: null,
        nivelComplejidad: null,
        nodo: null,
        medicamento: true,
        carroEmergencia: null,
        idpadre: null
    };
    public busqueda;
    public conceptos = [];
    public conceptoSeleccionado;

    @Output() objNuevoMedicamento = new EventEmitter();

    constructor(
        public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService,
        private SNOMED: SnomedService
    ) { }

    agregar() {
        this.objNuevoMedicamento.emit(this.datosParaAgregar);
    }

    selectConcept(unConcepto) {
        this.conceptoSeleccionado = unConcepto;
        this.datosParaAgregar.concepto = unConcepto;
        this.busqueda = unConcepto.term;
    }

    loadMedicamentos(event) {
        if (event && event.query) {
            const query = {
                search: event.query,
                semanticTag: ['producto', 'fármaco de uso clínico']
            };
            this.SNOMED.get(
                query
            ).subscribe((salida: any) => {
                this.conceptos = salida;
                event.callback(salida);

            });

        } else {

            event.callback([]);
        }
    }


}
