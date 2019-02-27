import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { RUPComponent } from '../../core/rup.component';


@Component({
    selector: 'rup-seccionesAccordion',
    templateUrl: 'seccionesAccordion.html',
    // utilizamos ViewEncapsulation.none para uniformar el estilo de los accordion en este componente!!!
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['seccionesAccordion.scss'],
})

export class SeccionesAccordionComponent extends RUPComponent implements OnInit {

    @Input() elementoRUP;
    @Input() registro;
    @Input() prestacion;
    @Input() soloValores;

    public accordionActive = 0;
    public unidadesOrganizativas = [];
    public desplegarTodo = false;
    public mensajeAccionAccordion = 'Desplegar';

    ngOnInit() {
        if (this.registro && !this.registro.valor) {
            this.registro.valor = {
                unidadOrganizativa: null
            };
        }
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.unidadesOrganizativas = organizacion.unidadesOrganizativas;
        });
    }

    accordionSeleccionado(i, concepto: any) {
        if (this.accordionActive === i) {
            this.accordionActive = -1;
            this.prestacionesService.clearRefSetData();
        } else {
            this.accordionActive = i;
            this.prestacionesService.setRefSetData(concepto);
            this.prestacionesService.clearData();
        }
    }

    desplegarAccordions() {
        this.desplegarTodo = !this.desplegarTodo;
        this.mensajeAccionAccordion = this.desplegarTodo ? 'Colapsar' : 'Desplegar';
        this.accordionActive = -1;
        this.prestacionesService.clearRefSetData();
    }

    VerArbolRelaciones() {
    }
}
