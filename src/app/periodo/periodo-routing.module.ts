import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListPeriodoComponent } from "./list-periodo/list-periodo.component";
import { CrudPeriodoComponent } from "./crud-periodo/crud-periodo.component";
import { PeriodoComponent } from "./periodo.component";
import { AuthGuard } from "../_guards/auth.guard";

const routes: Routes = [{
    path: '',
    component: PeriodoComponent,
    children: [
        {
            path: "list-periodo",
            component: ListPeriodoComponent,
            //canActivate: [AuthGuard],
          },
          {
            path: "crud-periodo",
            component: CrudPeriodoComponent,
            //canActivate: [AuthGuard],
          }
    ]
}]

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class PeriodoRoutingModule { }

export const routedComponents = [
    PeriodoComponent,
    ListPeriodoComponent,
    CrudPeriodoComponent
]