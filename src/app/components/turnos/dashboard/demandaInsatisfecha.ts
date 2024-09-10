import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';
import { ProfesionalService } from './../../../services/profesional.service';

@Component({
    selector: 'demandaInsatisfecha',
    templateUrl: 'demandaInsatisfecha.html',
})

export class demandaInsatisfechaComponent {

    @Input() paciente: IPaciente;
    @Input() origen = 'citas';
    @Input() estado = 'pendiente';
    @Output() demandaCerrada = new EventEmitter<any>();

    tipoPrestacion: any;
    permisos = [];
    profesional: any;
    motivos = [
        { id: 1, nombre: 'No existe la oferta en el efector' },
        { id: 2, nombre: 'No hay turnos disponibles' },
        { id: 3, nombre: 'Oferta rechazada por el paciente' }
    ];
    motivo: any;
    organizacion = this.auth.organizacion;

    constructor(
        public auth: Auth,
        public plex: Plex,
        public conceptosTurneablesService: ConceptosTurneablesService,
        public profesionalService: ProfesionalService,
        public listaEsperaService: ListaEsperaService,
    ) { }

    loadTipoPrestaciones(event) {
        this.conceptosTurneablesService.getByPermisos(null, 'ambulatorio').subscribe((data) => {
            event.callback(data);
        });
    }

    loadProfesionales(event) {
        const query = {
            nombreCompleto: event.query,
            habilitado: true
        };
        this.profesionalService.get(query).subscribe(event.callback);
    }

    guardar() {
        if (this.motivo && this.tipoPrestacion) {
            this.listaEsperaService.save({ id: this.paciente.id }, this.tipoPrestacion, this.estado, this.profesional, this.organizacion, this.motivo.nombre, this.origen).subscribe({
                complete: () => {
                    this.plex.toast('success', 'Demanda insatisfecha guardada exitosamente!');
                    this.cerrar();
                },
                error: (e) => this.plex.toast('danger', e.message, 'Ha ocurrido un error al guardar')
            });
        }
    }

    cerrar() {
        this.demandaCerrada.emit();
    }

}
