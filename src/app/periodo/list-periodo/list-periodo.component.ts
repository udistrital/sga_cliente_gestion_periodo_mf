import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  Inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from '../../../data/parametros.service';
import { Periodo } from '../../../data/models/periodo';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import * as moment from 'moment';
import { PopUpManager } from 'src/app/managers/popup-manager';

@Component({
  selector: 'list-periodo',
  templateUrl: './list-periodo.component.html',
  styleUrls: ['./list-periodo.component.scss'],
})
export class ListPeriodoComponent implements OnInit {
  uid: number;
  info_periodo: Periodo;
  year = [];
  periodo = [];
  opcionSeleccionadoAno: string = '0';
  verSeleccionAno: string = '';
  opcionSeleccionadoPeriodo: string = '0';
  verSeleccionPeriodo: string = '';
  verSeleccionPeriodoArre: string = '';
  @Output() eventChange = new EventEmitter();

  dataSource: MatTableDataSource<Periodo>;
  matAccordionStep = -1;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = [
    'Year',
    'Ciclo',
    'Descripcion',
    'CodigoAbreviacion',
    'Activo',
    'InicioVigencia',
    'FinVigencia',
    'acciones',
  ];
  nombresColumnas = [];
  columnasFechas = ['InicioVigencia', 'FinVigencia'];
  paginatorLabels;

  @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    public dialog: MatDialog
  ) {
    this.nombresColumnas['Year'] = 'GLOBAL.ano';
    this.nombresColumnas['Ciclo'] = 'GLOBAL.periodo';
    this.nombresColumnas['Descripcion'] = 'GLOBAL.descripcion';
    this.nombresColumnas['CodigoAbreviacion'] = 'GLOBAL.codigo_abreviacion';
    this.nombresColumnas['Activo'] = 'GLOBAL.activo';
    this.nombresColumnas['InicioVigencia'] = 'GLOBAL.fecha_inicio';
    this.nombresColumnas['FinVigencia'] = 'GLOBAL.fecha_fin';
    this.nombresColumnas['acciones'] = 'GLOBAL.acciones';

    this.loadData();
    this.loadAno();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.parametrosService
      .get(
        'periodo?query=CodigoAbreviacion:PA&limit=0&sortby=Activo,Year,Ciclo&order=desc'
      )
      .subscribe((res) => {
        if (res !== null) {
          const data = <any[]>res['Data'];
          data.forEach((item) => {
            item.searchField = `${item.Year} ${item.Ciclo} ${
              item.Descripcion
            } ${item.CodigoAbreviacion} ${item.InicioVigencia} ${
              item.FinVigencia
            } ${item.Activo ? 'activo' : 'inactivo'}`;
            item.combinedYearCycle = `${item.Year}-${item.Ciclo}`;
          });
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  loadAno() {
    this.parametrosService
      .get(
        'periodo?query=CodigoAbreviacion:PA&fields=Year&sortby=Year&order=desc'
      )
      .subscribe(
        (res) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            let year = <any[]>res['Data'];
            let conjunto: Set<any> = new Set();
            year.forEach(function (value) {
              conjunto.add(value.Year);
            });
            let listaSinRepetidos: number[] = Array.from(conjunto);
            this.year = listaSinRepetidos.map((numero) => {
              return { Year: numero };
            });
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status)
          );
        }
      );
  }

  capturarAno() {
    if (this.opcionSeleccionadoAno == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_ano')
      );
    } else {
      this.verSeleccionAno = '' + this.opcionSeleccionadoAno['Year'];
      this.loadPeriodo();
    }
  }

  loadPeriodo() {
    this.parametrosService
      .get(
        'periodo?query=Year:' +
          this.verSeleccionAno +
          ',CodigoAbreviacion:PA&fields=Ciclo&sortby=Ciclo&order=asc'
      )
      .subscribe(
        (res) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any[]>res['Data'];
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status)
          );
        }
      );
  }

  capturarPeriodo() {
    if (this.opcionSeleccionadoPeriodo == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_ano')
      );
    } else {
      this.verSeleccionPeriodo = this.opcionSeleccionadoPeriodo['Ciclo'];
      this.traerPeriodoSelect();
    }
  }

  traerPeriodoSelect() {
    this.parametrosService
      .get(
        'periodo?query=Year:' +
          this.verSeleccionAno +
          ',Ciclo:' +
          this.verSeleccionPeriodo
      )
      .subscribe(
        (res) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.info_periodo = <Periodo>(<any[]>res['Data'])[0];
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status)
          );
        }
      );
  }

  togglePeriodo(periodo: Periodo) {
    const activar = !periodo.Activo;
    const mensaje = activar
      ? 'periodo.periodo_habilitar'
      : 'periodo.periodo_deshabilitar';
    const accion = activar
      ? 'periodo.periodo_habilitado'
      : 'periodo.periodo_deshabilitado';

    this.popUpManager
      .showConfirmAlert(this.translate.instant(mensaje))
      .then((ok) => {
        if (ok.value) {
          periodo.Activo = activar;
          this.parametrosService.put('periodo', periodo).subscribe((res) => {
            this.eventChange.emit(true);
            this.loadData();
            this.popUpManager.showSuccessAlert(this.translate.instant(accion));
          });
        }
      });
  }

  viewDetails(periodo: Periodo) {
    this.dialog.open(DialogOverviewExampleDialog, {
      width: '380px',
      data: periodo,
    });
  }

  ngOnInit() {}

  onEdit(data): void {
    this.uid = data.Id;
    this.activetab();
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  activetab(): void {
    this.tabGroup.selectedIndex = this.tabGroup.selectedIndex == 0 ? 1 : 0;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.tabGroup.selectedIndex = 1;
    } else {
      this.tabGroup.selectedIndex = 2;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.activetab();
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase(); // Remove whitespace and convert to lowercase

    this.dataSource.filterPredicate = (data: Periodo, filter: string) => {
      const searchString = `${data.Year} ${data.Ciclo} ${data.Descripcion} ${
        data.CodigoAbreviacion
      } ${data.InicioVigencia} ${data.FinVigencia} ${
        data.Activo ? 'activo' : 'inactivo'
      }`.toLowerCase();
      const formattedDate = `${moment(data.InicioVigencia).format(
        'DD-MM-YYYY'
      )} ${moment(data.FinVigencia).format('DD-MM-YYYY')}`.toLowerCase();
      const combinedYearCycle = `${data.Year}-${data.Ciclo}`.toLowerCase();

      return (
        searchString.includes(filter) ||
        formattedDate.includes(filter) ||
        combinedYearCycle.includes(filter)
      );
    };

    this.dataSource.filter = filterValue;
  }

  formatValue(columna: string, valor: any): any {
    let tipo = typeof valor;
    let formatedValue: any;
    switch (tipo) {
      case 'boolean':
        formatedValue =
          valor == true
            ? this.translate.instant('GLOBAL.activo')
            : this.translate.instant('GLOBAL.inactivo');
        break;

      case 'string':
        formatedValue = this.columnasFechas.includes(columna)
          ? moment(valor).format('DD-MM-YYYY')
          : valor;
        break;

      default:
        formatedValue = valor;
        break;
    }

    return formatedValue;
  }

  setStep(index: number) {
    this.matAccordionStep = index;
  }

  nextStep() {
    this.matAccordionStep++;
  }

  prevStep() {
    this.matAccordionStep--;
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'periodo.detalles_periodo' | translate }}</h2>
    <mat-dialog-content>
      <p>
        <strong>{{ 'GLOBAL.ano' | translate }}:</strong> {{ data.Year }}
      </p>
      <p>
        <strong>{{ 'GLOBAL.periodo' | translate }}:</strong> {{ data.Ciclo }}
      </p>
      <p>
        <strong>{{ 'GLOBAL.descripcion' | translate }}:</strong>
        {{ data.Descripcion }}
      </p>
      <p>
        <strong>{{ 'GLOBAL.codigo_abreviacion' | translate }}:</strong>
        {{ data.CodigoAbreviacion }}
      </p>
      <p>
        <strong>{{ 'GLOBAL.fecha_inicio' | translate }}:</strong>
        {{ data.InicioVigencia | date : 'dd/MM/yyyy' }}
      </p>
      <p>
        <strong>{{ 'GLOBAL.fecha_fin' | translate }}:</strong>
        {{ data.FinVigencia | date : 'dd/MM/yyyy' }}
      </p>
    </mat-dialog-content>

    <mat-dialog-actions style="display: flex; justify-content: center;">
      <button mat-flat-button mat-dialog-close color="primary">{{ 'GLOBAL.cerrar' | translate }}</button>
    </mat-dialog-actions>
  `,
})
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Periodo
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
