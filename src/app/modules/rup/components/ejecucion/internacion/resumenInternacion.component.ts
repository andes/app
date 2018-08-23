import { Component, Output, Input, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { PrestacionesService } from '../../../services/prestaciones.service';

@Component({
    selector: 'internacion-resumen',
    templateUrl: 'resumenInternacion.html',
    styleUrls: ['resumenInternacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ResumenInternacionComponent implements OnInit {


    @Input() prestacion;
    @Input() paciente;
    @Output() data: EventEmitter<any> = new EventEmitter<any>();

    public pases;
    public editarIngreso = false;
    public editarEgreso = false;
    public btnIniciarEditar;

    constructor(
        public prestacionesService: PrestacionesService
    ) { }


    ngOnInit() {
        this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
            this.pases = lista;
        });
    }

    onBtnIniciarEditar(event) {
        this.btnIniciarEditar = event;
    }


    /**
 * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
 */
    public getHabitacionName(pase) {
        let sec = pase.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }


    /**
     * Emite un false para ocultar el componente
     */
    cancelar() {
        this.data.emit(false);
    }

    editar(param) {
        switch (param) {
            case 'ingreso':
                this.editarIngreso = true;
                break;
            case 'egreso':
                this.editarEgreso = true;
                break;
            default:
                break;
        }
    }

    cierraEditar(event) {
        this.editarIngreso = false;
        this.editarEgreso = false;
    }

    // Rotacion flechita
    flechita: boolean = false;
    rotarFlechita(event){
        this.flechita = !this.flechita;       
    }
    
}
