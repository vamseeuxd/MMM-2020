import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransactionListPage} from './pages/transaction-list/transaction-list';
import {LoginPage} from './pages/login/login';
import {MonthlyTransactionsPage} from './pages/monthly-transactions/monthly-transactions';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'transaction-list',
    component: TransactionListPage
  },
  {
    path: 'monthly-transactions',
    component: MonthlyTransactionsPage
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
