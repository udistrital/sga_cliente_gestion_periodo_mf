import { PeriodoRoutingModule, routedComponents } from './periodo-routing.module';
import { NgModule } from '@angular/core';
import { CrudPeriodoComponent } from './crud-periodo/crud-periodo.component';
import { ParametrosService } from '../../data/parametros.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    MatTabsModule,
    MatCardModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatTableModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    PeriodoRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ParametrosService,
  ],
  exports: [
    CrudPeriodoComponent
  ],
})
export class PeriodoModule { }
