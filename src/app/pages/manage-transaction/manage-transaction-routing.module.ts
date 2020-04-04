import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ManageTransactionPage} from './manage-transaction';

const routes: Routes = [
  {
    path: '',
    component: ManageTransactionPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class ManageTransactionPageRoutingModule {
}
