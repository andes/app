import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';
import { ObraSocialService } from 'src/app/services/obraSocial.service';

@Component({
    selector: 'seleccionar-financiador',
    templateUrl: 'seleccionar-financiador.html',
})

export class SeleccionarFinanciadorComponent implements OnChanges {
    public obrasSociales: IObraSocial[] = [];
    public selectorFinanciadores: IObraSocial[] = [];
    public selectorObrasSociales = [];
    public obraSocial;
    public showSelector = false;
    public showListado = false;
    public financiador;
    public financiadorBase = {
        nombre: undefined,
        financiador: undefined,
        prepaga: false,
        codigoPuco: undefined,
    };

    @Input() paciente;
    @Output() setFinanciador = new EventEmitter<any>();

    constructor(
        public obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,
    ) { }

    seleccionarObraSocial(event) {
        this.showListado = false;

        if (event.value === 'otras') {
            this.showListado = true;
        } else {
            const foundObraSocial = this.obrasSociales.find(os => os.nombre === event.value || os.financiador === event.value);
            this.obraSocial = event.value;

            this.setFinanciador.emit({ ...this.financiadorBase, ...foundObraSocial, prepaga: false });
        }
    }

    seleccionarOtro(event) {
        if (event.value) {
            const { prepaga, nombre, financiador, codigoPuco } = event.value;

            this.setFinanciador.emit({ ...this.financiadorBase, prepaga: prepaga || false, nombre, financiador, codigoPuco, origen: 'ANDES' });
        } else {
            this.setFinanciador.emit(undefined);
        }
    }

    cargarPrepagas() {
        this.obraSocialService.getListado({}).subscribe(listado => this.selectorFinanciadores = listado.filter(financiador => this.obrasSociales.every(os => os.nombre !== financiador.nombre)));
    }

    cargarObraSocial(paciente) {
        if (!paciente) {
            return;
        } else {
            this.obrasSociales = paciente.financiador;
        }

        if (this.obrasSociales.length) {
            const { codigoPuco, financiador, nombre, origen } = this.obrasSociales[0];

            this.selectorObrasSociales = this.obrasSociales.map((os: IObraSocial) => ({ id: os.nombre || os.financiador, label: os.nombre || os.financiador }));
            this.obraSocial = nombre || financiador;
            this.setFinanciador.emit({ ...this.financiadorBase, codigoPuco, financiador, nombre, origen });

            this.selectorObrasSociales.push({ 'id': 'otras', 'label': 'Otras' });
        } else {
            this.obraSocial = undefined;
            this.setFinanciador.emit(undefined);
        }

        this.showSelector = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente.currentValue.id) {
            this.showSelector = false;
            this.showListado = false;
            this.financiador = undefined;

            this.pacienteService.getById(changes.paciente.currentValue.id).subscribe(paciente => {
                this.cargarObraSocial(paciente);
                this.cargarPrepagas();
            });
        }
    }
}
