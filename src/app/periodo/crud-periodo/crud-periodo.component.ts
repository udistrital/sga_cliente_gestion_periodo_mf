import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Periodo } from '../../../data/models/periodo';
import { ParametrosService } from '../../../data/parametros.service';
import { PopUpManager } from '../../managers/popup-manager';
import * as moment from 'moment';

@Component({
  selector: 'crud-periodo',
  templateUrl: './crud-periodo.component.html',
  styleUrls: ['./crud-periodo.component.scss'],
})
export class CrudPeriodoComponent implements OnInit {
  periodo_id: number;

  @Input('periodo_id')
  set name(periodo_id: number) {
    this.periodo_id = periodo_id;
    this.loadPeriodo();
  }

  @Output() eventChange = new EventEmitter();

  periodoForm: FormGroup;
  infoPeriodo: Periodo;

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private formBuilder: FormBuilder
  ) {
  }

  loadPeriodo(): void {
    if (this.periodo_id !== undefined && this.periodo_id !== 0) {
      this.parametrosService
        .get('periodo/' + this.periodo_id)
        .subscribe(res => {
          if (res !== null) {
            this.infoPeriodo = <Periodo>res['Data'];

            this.periodoForm.patchValue({
              year: this.infoPeriodo.Year,
              periodo: this.infoPeriodo.Ciclo,
              fechaInicio: new Date(this.infoPeriodo.InicioVigencia),
              fechaFin: new Date(this.infoPeriodo.FinVigencia)
            });
          }
        });
    } else {
      this.infoPeriodo = undefined;
    }
  }

  ngOnInit() {
    this.periodoForm = this.formBuilder.group({
      year: new FormControl('', [Validators.required, Validators.min(1948), Validators.max(3000)]),
      periodo: new FormControl('', [Validators.required, Validators.min(1), Validators.max(3)]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
    }, { validator: this.fechaFinMayorQueInicio });

    this.periodoForm.get('fechaInicio').valueChanges.subscribe((fechaInicio) => {
      this.periodoForm.get('fechaFin').setValidators([Validators.required, this.fechaFinValidator(fechaInicio)]);
      this.periodoForm.get('fechaFin').updateValueAndValidity();
    });

    this.loadPeriodo();
  }

  fechaFinMayorQueInicio(control: FormGroup): { [key: string]: boolean } | null {
    const fechaInicio = control.get('fechaInicio').value;
    const fechaFin = control.get('fechaFin').value;
  
    return fechaInicio && fechaFin && fechaInicio > fechaFin ? { 'fechaFinMayorQueInicio': true } : null;
  }

  fechaFinValidator(fechaInicio: string): any {
    return (control: FormControl) => {
      const fechaFin = control.value;
      if (fechaFin && fechaInicio && fechaInicio > fechaFin) {
        return { 'fechaFinMayorQueInicio': true };
      }
      return null;
    };
  }

  getControl(name: string): AbstractControl {
    return this.periodoForm.get(name);
  }

  getErrorMessage(control: FormControl, name: string, min: number, max: number): string {
    return control.hasError('required') ? this.translate.instant('GLOBAL.error_' + name) :
      control.hasError('min') ? this.translate.instant('GLOBAL.err_min') + min :
      control.hasError('max') ? this.translate.instant('GLOBAL.err_max') + max :
            '';
  }

  onSubmit(): void {
    let title = this.periodo_id == null ? 'GLOBAL.registrar' : 'GLOBAL.actualizar';
    let message = this.periodo_id == null ? 'periodo.seguro_continuar_registrar_periodo' : 'periodo.seguro_actualizar_periodo';
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(message),
        this.translate.instant(title),
      )
      .then(ok => {
        if (ok.value) {
          this.infoPeriodo = this.infoPeriodo == null ? new Periodo() : this.infoPeriodo;
          this.infoPeriodo.Year = this.periodoForm.value.year;
          this.infoPeriodo.Ciclo = '' + this.periodoForm.value.periodo;
          this.infoPeriodo.Nombre = this.periodoForm.value.year + '-' + this.periodoForm.value.periodo;
          this.infoPeriodo.Descripcion = 'Periodo académico ' + this.infoPeriodo.Nombre;
          this.infoPeriodo.CodigoAbreviacion = 'PA';
          this.infoPeriodo.Activo = true;
          this.infoPeriodo.InicioVigencia =
            moment(this.periodoForm.value.fechaInicio).format('YYYY-MM-DD') + 'T10:00:00Z';
          this.infoPeriodo.FinVigencia =
            moment(this.periodoForm.value.fechaFin).format('YYYY-MM-DD') + 'T10:00:00Z';
          this.infoPeriodo.AplicacionId = 41; // ID de SGA en Configuracion_CRUD

          if (this.periodo_id == null) {
            this.registrar();
          } else {
            this.actualizar();
          }
        }
      });
  }

  registrar(): void {
    this.parametrosService
      .post('periodo', this.infoPeriodo)
      .subscribe(res => {
        console.log(res);
        this.infoPeriodo = <Periodo>res['Data'];
        this.eventChange.emit(true);
        window.location.href = '#/pages/periodo/list-periodo';
        this.popUpManager.showSuccessAlert(
          this.translate.instant('periodo.periodo_creado'),
        );
      });
  }

  actualizar(): void {
    this.parametrosService
    .put('periodo', this.infoPeriodo)
    .subscribe(res => {
      this.loadPeriodo();
      this.eventChange.emit(true);
      window.location.href = '#/pages/periodo/list-periodo';
      this.popUpManager.showSuccessAlert(
        this.translate.instant('periodo.periodo_actualizado'),
      );
    });
  }
}
