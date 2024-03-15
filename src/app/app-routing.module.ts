import { APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmptyRouteComponent } from "./empty-route/empty-route.component";

const routes: Routes = [
  {
    path: 'empty-route',
    component: EmptyRouteComponent
  },
  {
    path: '',
    loadChildren: () => import ('./periodo/periodo.module').then(m => m.PeriodoModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    //useHash: true,
    // //enableTracing: true,
    //initialNavigation: 'disabled'
  })],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/periodo/" }],
})
export class AppRoutingModule {}
