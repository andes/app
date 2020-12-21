import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    templateUrl: 'recovery.html',
    styleUrls: ['recovery.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class RecoveryComponent implements OnInit {
    public loading = false;
    public password1 = '';
    public password2 = '';
    public token = null;

   @ViewChild('formulario', {static: true}) formulario;

    @Input()
    set show(value) {
      if (value) {
        this.formulario.show();
      }
    }

    @Output() closeModal = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        private activateRouter: ActivatedRoute
    ) { }


    ngOnInit() {
        // Busca el token y activa la cuenta
        this.activateRouter.paramMap.subscribe(params => {
            this.token = params.get('token');
            if (this.token) {
                this.formulario.show();
            }
        });
    }

    save(form) {
        if (form.valid) {
          if (this.password1 === this.password2) {
            this.loading = true;
              this.auth.resetPassword({ token: this.token, password: this.password1 }).subscribe(
                data => {
                  if (data.status === 'ok') {
                    this.plex.info('success', 'La contraseña ha sido restablecida correctamente');
                  } else {
                    this.plex.info('danger', 'Hubo un error en la actualización de la contraseña');
                  }
                  this.clearForm();
                  this.cancel();
                },
                err => {
                  this.plex.info('danger', err);
                  this.loading = false;
                }
              );
          }
        }
      }

      cancel() {
        this.formulario.showed = false;
        this.closeModal.emit();
        if (this.token) {
          this.router.navigate(['/auth/login']);
        }
      }

    clearForm() {
        this.loading = false;
        this.password1 = '';
        this.password2 = '';
      }
}
