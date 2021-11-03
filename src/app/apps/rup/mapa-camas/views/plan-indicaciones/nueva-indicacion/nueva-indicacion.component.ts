import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { IPrestacionRegistro } from 'src/app/modules/rup/interfaces/prestacion.registro.interface';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PlantillasService } from 'src/app/modules/rup/services/plantillas.service';
import { PlanIndicacionesServices } from '../../../services/plan-indicaciones.service';

@Component({
    selector: 'plan-indicaciones-nueva-indicacion',
    templateUrl: './nueva-indicacion.component.html'
})
export class PlanIndicacionesNuevaIndicacionComponent implements OnInit {

    @Output() save = new EventEmitter();

    private capa: string;
    private ambito: string;
    private idInternacion: string;


    selectedConcept = null;
    elementoRUP = null;
    registro = null;

    @Input() tipoPrestacion = {
        'conceptId' : '4981000013105',
        'term' : 'plan de indicaciones médicas',
        'fsn' : 'plan de indicaciones médicas (procedimiento)',
        'semanticTag' : 'procedimiento'
    };

    prestacion: IPrestacion = {
        solicitud: {
            tipoPrestacion: {
                'conceptId' : '4981000013105',
                'term' : 'plan de indicaciones médicas',
                'fsn' : 'plan de indicaciones médicas (procedimiento)',
                'semanticTag' : 'procedimiento'
            }
        }
    } as any;

    constructor(
        private elementoRUPService: ElementosRUPService,
        public ps: PlantillasService,
        private planIndicacionesServices: PlanIndicacionesServices,
        private route: ActivatedRoute,
        private auth: Auth
    ) {

    }

    ngOnInit() {
        this.capa = this.route.snapshot.paramMap.get('capa');
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.idInternacion = this.route.snapshot.paramMap.get('idInternacion');
    }

    onConceptoSelect(concepto) {
        this.selectedConcept = concepto;
        this.elementoRUP = this.elementoRUPService.buscarElemento(concepto, concepto.esSolicitud);
        this.ps.get(concepto.conceptId, true).subscribe(() => { });
        this.registro = new IPrestacionRegistro(this.elementoRUP, concepto);


    }

    onSave() {
        const nombre = this.registro.valor?.medicamento?.term || this.registro.concepto.term;

        const indicacion = {
            idInternacion: this.idInternacion,
            idPrestacion: null,
            idRegistro: this.registro.id,
            fechaInicio: new Date(),
            ambito: this.ambito,
            organizacion: this.auth.organizacion,
            profesional: {
                id: this.auth.profesional,
                nombre: this.auth.usuario.nombre,
                apellido: this.auth.usuario.apellido,
                documento: this.auth.usuario.documento
            },
            nombre: nombre,
            concepto: this.registro.concepto,
            valor: this.registro.valor,
            elementoRUP: this.elementoRUP.id,
            seccion: null,
            estados: [{
                tipo: 'draft',
                fecha: new Date()
            }]
        };
        this.save.emit(indicacion);
        // this.planIndicacionesServices.create(indicacion);
    }

    onCancel() {
        this.save.emit();
    }
}
