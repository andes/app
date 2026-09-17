import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';

@Component({
selector: 'app-formTerapeutico',
templateUrl: './formTerapeutico.html',
styleUrls: ['./formTerapeutico.scss']
})
export class FormTerapeuticoComponent implements OnInit {

    public columnas = [
{
key: 'Sistema',
label: 'Sistema'},
{
key: 'funcion',
label: 'Función'},
{
key: 'grupoFarmacologico',
label: 'Grupo Farmacológico'},
{
key: 'nombre',
label: 'Nombre'},
{
key: 'conceptoSnomed',
label: 'Concepto SNOMED'}
];

    public sistemas = [
        { id: 'respiratorio', icon: 'pulmones-outline' },
        { id: 'vacunas', icon: 'vacuna' },
        { id: 'gastrointestinal', icon: 'gastrointestinal-outline', },
        { id: 'cardiovascular', icon: 'corazon-outline',}, 
        { id: 'genitourinario', icon: 'riñones-outline' },
        { id: 'antineoplasicos-e-inmunosupresores', icon: 'antineoplasicos'},
        { id: 'endocrino', icon: 'garganta'},
        { id: 'anticonceptivos', icon: 'aco-outline' },
        { id: 'anestesicos', icon: 'anestesia' },
        { id: 'emergencias-toxicologicas', icon: 'toxi-emer' }, 
        { id: 'analgesicos-puros', icon: 'frasco-outline'},
        { id: 'nervioso-central', icon: 'sist-nervioso' },
        { id: 'sanguineo', icon: 'uni-gota' },
        { id: 'contraste-radiologicos', icon: 'rayos'},
        { id: 'antinflamatorios', icon: 'pildora'},
        { id: 'bloqueantes-neuromusculares', icon: 'bloqueante'},
        { id: 'oftalmologico', icon: 'oftalmologico'},
        { id: 'antiinfecciosos', icon: 'infeccioso'},
        { id: 'metabolismo', icon: 'metabolismo'},
        { id: 'antisepticos-y-desinfectantes', icon: 'otro-frasco'},
        
    ];

    public sistemaSeleccionado: string = null;

  public funcion = [];
  public grupoFarmacologico = [];
  public medicamento = "";
  public conceptoSnomed = "";

   public opciones = [
        { id: 'a', nombre: 'alteradores de la motilidad intestinal' },
        { id: 'b', nombre: 'ablandadores fecales' },
        { id: 'c', nombre: 'antiulcerosos' },
        { id: 'd', nombre: 'antieméticos' },
        { id: 'e', nombre: 'enf inflamatorias intestinales' },
        { id: 'f', nombre: 'control hemorragia vericeal' },
        { id: 'g', nombre: 'tratamiento colestasis' }
    ];

public grupos = [
        { id: 'a', nombre: 'anticolinérgicos' },
        { id: 'b', nombre: 'procinéticos' },
        { id: 'c', nombre: 'laxantes' },
        { id: 'd', nombre: 'antidiarreicos' },
        { id: 'e', nombre: 'antagonistas h2' },
        { id: 'f', nombre: 'inhibidores de la bomba de protones' },
        { id: 'g', nombre: 'antiácidos no absorbibles' },
]

constructor(private router: Router,
private plex: Plex, public auth: Auth,
public servicioFormTerapeutico: FormTerapeuticoService) { }



    ngOnInit() {}



}
