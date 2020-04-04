import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {ManageTransactionPage} from './manage-transaction';
import {ManageTransactionPageRoutingModule} from './manage-transaction-routing.module';
import {SharedModule} from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ManageTransactionPageRoutingModule
  ],
  declarations: [ManageTransactionPage],
  entryComponents: [ManageTransactionPage]
})
export class ManageTransactionModule {
}
