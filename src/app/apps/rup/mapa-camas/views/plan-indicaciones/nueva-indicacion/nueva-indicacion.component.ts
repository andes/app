import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { INITIAL_CONFIG } from '@angular/platform-server';
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
    @Output() edit = new EventEmitter();
    private capa: string;
    private ambito: string;
    private idInternacion: string;


    selectedConcept = null;
    elementoRUP = null;
    registro = null;

    @Input() tipoPrestacion = {
        'conceptId': '4981000013105',
        'term': 'plan de indicaciones médicas',
        'fsn': 'plan de indicaciones médicas (procedimiento)',
        'semanticTag': 'procedimiento'
    };

    @Input() seccion = null;
    @Input() indicacion = null;


    prestacion: IPrestacion = {
        solicitud: {
            tipoPrestacion: {
                'conceptId': '4981000013105',
                'term': 'plan de indicaciones médicas',
                'fsn': 'plan de indicaciones médicas (procedimiento)',
                'semanticTag': 'procedimiento'
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

        if (this.seccion && this.seccion.registro) {
            this.onConceptoSelect({
                ...this.seccion.registro,
                esSolicitud: true
            });
        }
    }

    onConceptoSelect(concepto) {
        this.selectedConcept = concepto;
        this.elementoRUP = this.elementoRUPService.buscarElemento(concepto, concepto.esSolicitud);
        this.ps.get(concepto.conceptId, true).subscribe(() => { });
        this.registro = this.indicacion ? { valor: this.indicacion.valor } : new IPrestacionRegistro(this.elementoRUP, concepto);


    }

    onSave() {

        const nombre = this.registro.valor?.medicamento?.term || this.registro.concepto.term;
        const indicacion = {
            idInternacion: this.idInternacion,
            idPrestacion: null,
            idRegistro: this.registro.id,
            fechaInicio: new Date(),
            ambito: this.ambito,
            capa: this.capa,
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
            seccion: this.seccion.concepto,
            estados: [{
                tipo: 'draft',
                fecha: new Date()
            }]
        };

        if (this.indicacion?.estadoActual.tipo === 'draft') {
            this.indicacion.fechaInicio = indicacion.fechaInicio;
            this.indicacion.ambito = indicacion.ambito;
            this.indicacion.capa = indicacion.capa;
            this.indicacion.organizacion = indicacion.organizacion;
            this.indicacion.profesional = indicacion.profesional;
            this.indicacion.nombre = indicacion.nombre;
            this.indicacion.concepto = indicacion.concepto;
            this.indicacion.valor = indicacion.valor;
            this.indicacion.elementoRup = indicacion.elementoRUP;
            this.indicacion.seccion = indicacion.seccion;
            this.indicacion.estados = indicacion.estados;
            this.edit.emit(this.indicacion);
        } else {
            this.save.emit(indicacion);
        }

        // this.planIndicacionesServices.create(indicacion);
    }

    onCancel() {
        this.save.emit();
    }
}
