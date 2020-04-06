import {ModuleWithProviders, NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireAuthGuardModule} from '@angular/fire/auth-guard';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {TransactionListPage} from './pages/transaction-list/transaction-list';
import {CommonModule} from '@angular/common';
import {ManageTransactionPage} from './pages/manage-transaction/manage-transaction';
import {TransactionBreakupListPage} from './pages/transaction-breakup-list/transaction-breakup-list';
import {LoginPage} from './pages/login/login';
import {MonthlyTransactionsPage} from './pages/monthly-transactions/monthly-transactions';

@NgModule({
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    FormsModule,
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    FormsModule,
    IonicModule,
    CommonModule,
    TransactionListPage,
    ManageTransactionPage,
    TransactionBreakupListPage,
    LoginPage,
    MonthlyTransactionsPage,
    ReactiveFormsModule,
  ],
  declarations: [
    TransactionListPage,
    TransactionBreakupListPage,
    LoginPage,
    MonthlyTransactionsPage,
    ManageTransactionPage
  ],
  entryComponents: [
    TransactionListPage,
    TransactionBreakupListPage,
    LoginPage,
    MonthlyTransactionsPage,
    ManageTransactionPage
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
