import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutoSuggestComponent } from './auto-suggest/auto-suggest.component';

const routes: Routes = [{
  path: '',
  component: AutoSuggestComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
