import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {TransactionBreakupListPage} from '../transaction-breakup-list/transaction-breakup-list';
import {ManageTransactionPage} from '../manage-transaction/manage-transaction';
import {ManageTransactionModule} from '../manage-transaction/manage-transaction.module';
import {TransactionListPage} from './transaction-list';
import {TransactionListRoutingModule} from './transaction-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageTransactionModule,
    TransactionListRoutingModule
  ],
  declarations: [
    TransactionListPage,
    TransactionBreakupListPage,
  ],
  entryComponents: [
    TransactionBreakupListPage,
  ]
})
export class TransactionListModule {
}
