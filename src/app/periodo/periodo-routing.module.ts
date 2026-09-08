import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPeriodoComponent } from './list-periodo/list-periodo.component';
import { PeriodoComponent } from './periodo.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: PeriodoComponent,
    children: [
      {
        path: 'lista',
        canActivate: [AuthGuard],
        component: ListPeriodoComponent,
        data: { canManage: false },
      },
      {
        path: 'crear',
        canActivate: [AuthGuard],
        component: ListPeriodoComponent,
        data: { canManage: true },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeriodoRoutingModule {}

export const routedComponents = [
  PeriodoComponent,
  ListPeriodoComponent,
];
