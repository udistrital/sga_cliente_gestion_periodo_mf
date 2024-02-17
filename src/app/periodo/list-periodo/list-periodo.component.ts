import { Component, EventEmitter, OnInit, Output, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from '../../../data/parametros.service';
import { Periodo } from '../../../data/models/periodo';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabGroup } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';
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

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['Year', 'Ciclo', 'Descripcion', 'CodigoAbreviacion', 'Activo', 'InicioVigencia', 'FinVigencia', 'acciones'];
  nombresColumnas = []
  columnasFechas = ['InicioVigencia', 'FinVigencia']
  paginatorLabels;

  @ViewChild('tabGroup', { static: true }) tabGroup: MatTabGroup;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
  ) {
    this.nombresColumnas["Year"] = "GLOBAL.ano";
    this.nombresColumnas["Ciclo"] = "GLOBAL.periodo";
    this.nombresColumnas["Descripcion"] = "GLOBAL.descripcion";
    this.nombresColumnas["CodigoAbreviacion"] = "GLOBAL.codigo_abreviacion";
    this.nombresColumnas["Activo"] = "GLOBAL.activo";
    this.nombresColumnas["InicioVigencia"] = "GLOBAL.fecha_inicio";
    this.nombresColumnas["FinVigencia"] = "GLOBAL.fecha_fin";
    this.nombresColumnas["acciones"] = "GLOBAL.acciones";

    this.paginatorLabels = {
      itemsPerPageLabel: this.translate.instant('periodo.items_pagina')
    };

    this.loadData();
    this.loadAno();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.parametrosService
      .get('periodo?query=CodigoAbreviacion:PA&limit=0&sortby=Year,Ciclo&order=desc')
      .subscribe(res => {
        if (res !== null) {
          const data = <any[]>res['Data'];
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  loadAno() {
    this.parametrosService
      .get('periodo?query=CodigoAbreviacion:PA&fields=Year&sortby=Year&order=desc')
      .subscribe(
        res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            let year = <any[]>res['Data'];
            let conjunto: Set<any> = new Set();
            year.forEach(function (value) {
              conjunto.add(value.Year);
            });
            let listaSinRepetidos: number[] = Array.from(conjunto);
            this.year = listaSinRepetidos.map(numero => {
              return { Year: numero };
            });
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status),
          );
        },
      );
  }

  capturarAno() {
    // Pasamos el valor seleccionado a la variable verSeleccion
    if (this.opcionSeleccionadoAno == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_ano'),
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
          ',CodigoAbreviacion:PA&fields=Ciclo&sortby=Ciclo&order=asc',
      )
      .subscribe(
        res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any[]>res['Data'];
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status),
          );
        },
      );
  }

  capturarPeriodo() {
    if (this.opcionSeleccionadoPeriodo == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_ano'),
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
          this.verSeleccionPeriodo,
      )
      .subscribe(
        res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.info_periodo = <Periodo>(<any[]>res['Data'])[0];
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status),
          );
        },
      );
  }

  ActivarPeriodo() {
    if (this.info_periodo == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_periodo'),
      );
    } else {
      if (this.info_periodo.Activo === true) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.atencion'),
          this.translate.instant('periodo.habilitado'),
        );
      } else {
        this.popUpManager
          .showConfirmAlert(this.translate.instant('periodo.periodo_habilitar'))
          .then(ok => {
            if (ok.value) {
              this.info_periodo.Activo = true;
              this.parametrosService
                .put('periodo', this.info_periodo)
                .subscribe(res => {
                  this.eventChange.emit(true);
                  this.loadData();
                  this.popUpManager.showSuccessAlert(
                    this.translate.instant('periodo.periodo_habilitado'),
                  );
                });
            }
          });
      }
    }
  }

  DeshabilitarPeriodo() {
    if (this.info_periodo == null) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.atencion'),
        this.translate.instant('periodo.seleccione_periodo'),
      );
    } else {
      if (this.info_periodo.Activo === false) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.atencion'),
          this.translate.instant('periodo.deshabilitado'),
        );
      } else {
        this.popUpManager
          .showConfirmAlert(
            this.translate.instant('periodo.periodo_deshabilitar'),
          )
          .then(ok => {
            if (ok.value) {
              this.info_periodo.Activo = false;
              this.parametrosService
                .put('periodo', this.info_periodo)
                .subscribe(res => {
                  this.eventChange.emit(true);
                  this.loadData();
                  this.popUpManager.showSuccessAlert(
                    this.translate.instant('periodo.periodo_deshabilitado'),
                  );
                });
            }
          });
      }
    }
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

  onDelete(data): void {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant('periodo.seguro_eliminar_periodo'),
        this.translate.instant('GLOBAL.eliminar'),
      )
      .then(willDelete => {
        if (willDelete.value) {
          this.parametrosService
            .delete('periodo', data)
            .subscribe(res => {
              console.log(res);
              if (res !== null) {
                this.loadData();
                this.popUpManager.showSuccessAlert(
                  this.translate.instant('periodo.periodo_eliminado'),
                );
              }
            });
        }
      });
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
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  formatValue(columna: string, valor: any): any {
    let tipo = typeof valor;
    let formatedValue: any;
    switch (tipo) {
      case 'boolean':
        formatedValue = valor == true ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo');
        break;

      case 'string':
        formatedValue = this.columnasFechas.includes(columna) ? moment(valor).format('DD-MM-YYYY') : valor;
        break;
      
      default:
        formatedValue = valor;
        break;
    }

    return formatedValue;
  }
}
