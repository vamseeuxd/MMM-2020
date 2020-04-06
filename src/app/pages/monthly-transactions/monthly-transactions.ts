import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {LoadingController} from '@ionic/angular';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {Transaction} from '../../models/Transaction';
import {RecurringTransactions} from '../../utils/recurring-transactions';

@Component({
  selector: 'monthly-transactions',
  templateUrl: 'monthly-transactions.html',
  styleUrls: ['./monthly-transactions.scss'],
})
export class MonthlyTransactionsPage implements AfterViewInit {
  selectedMonth = '1'; // (new Date().getMonth() + 1).toString();
  selectedMonthAction: BehaviorSubject<string> = new BehaviorSubject<string>(this.selectedMonth);
  selectedMonth$ = this.selectedMonthAction.asObservable();
  selectedYear = new Date().getFullYear().toString();
  selectedYearAction: BehaviorSubject<string> = new BehaviorSubject<string>(this.selectedYear);
  selectedYear$ = this.selectedYearAction.asObservable();
  selectedType = 'income';
  selectedTypeAction: BehaviorSubject<string> = new BehaviorSubject<string>(this.selectedType);
  selectedType$ = this.selectedTypeAction.asObservable();
  isDataInit = false;
  months = [
    {id: '1', label: 'January'},
    {id: '2', label: 'February'},
    {id: '3', label: 'March'},
    {id: '4', label: 'April'},
    {id: '5', label: 'May'},
    {id: '6', label: 'June'},
    {id: '7', label: 'July'},
    {id: '8', label: 'August'},
    {id: '9', label: 'September'},
    {id: '10', label: 'October'},
    {id: '11', label: 'November'},
    {id: '12', label: 'December'},
  ];
  years = [];
  loadingIndicator: HTMLIonLoadingElement = null;
  private settlementsCollection: AngularFirestoreCollection<any> = this.firestore.collection<any>('settlements');
  settlements$ = this.settlementsCollection.get();
  private recurringTransactions: RecurringTransactions = new RecurringTransactions();
  breakups$: Observable<any[]> = combineLatest(
    this.fireAuth.user, this.selectedType$, this.selectedMonth$, this.selectedYear$, this.settlements$
  ).pipe(
    switchMap(([user, transactionType, selectedMonth, selectedYear]) => {
      this.isDataInit = false;
      return this.firestore.collection<Transaction>(
        'transactions',
        ref => {
          return ref.where('userUid', '==', user.providerData[0].uid)
            .where('type', '==', transactionType);
        }
      ).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Transaction;
          const id = a.payload.doc.id;
          return {id, ...data};
        }))
      );
    }),
    switchMap(transactions => {
      const onlyBreakups = [];
      const data = transactions.map(transaction => this.recurringTransactions.getTransactionBreakups(transaction));
      data.forEach(d => {
        onlyBreakups.push(...d);
      });
      return of(onlyBreakups.filter(breakups => {
        const [month, date, year] = breakups.dueOn.split('-');
        return (month === this.selectedMonth && year === this.selectedYear);
      }));
    }),
    switchMap(breakups => {
      const filterQueryList = breakups.map(breakup => breakup.transactionId);
      const observable1 = filterQueryList.length > 0 ? this.firestore
        .collection<any>('settlements', ref => ref.where('transactionId', 'in', filterQueryList))
        .snapshotChanges()
        .pipe(
          map(settlements => settlements.map(
            settlement => {
              const data = settlement.payload.doc.data();
              const id = settlement.payload.doc.id;
              return {id, ...data};
            })
          )
        ) : of([]);
      const observable2 = of(breakups);
      return combineLatest(observable1, observable2);
    }),
    switchMap(breakups => {
      const finalBreakUps = breakups[1].map(data1 => {
        const isSettled = breakups[0].filter(data2 => {
          return data1.transactionId === data2.transactionId && data1.dueOn === data2.dueOn;
        }).length > 0;
        if (isSettled) {
          const id = breakups[0].find(data2 => (data1.transactionId === data2.transactionId && data1.dueOn === data2.dueOn)).id;
          return {...data1, isSettled, id};
        } else {
          return {...data1, isSettled};
        }
      });
      return of(finalBreakUps);
    }),
    tap(ddd => {
      setTimeout(() => {
        this.isDataInit = true;
        this.hideLoadingIndicator();
      }, 50);
    })
  );

  constructor(
    public router: Router,
    public loadingController: LoadingController,
    public fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.getYearsList();
    this.showLoadingIndicator().then(r => console.log);
  }

  selectedMonthLabel = selectedMonth => this.months.find(d => (d.id === selectedMonth)).label;

  async showLoadingIndicator() {
    if (!this.loadingIndicator) {
      this.loadingIndicator = await this.loadingController.create({message: 'Please wait...'});
      await this.loadingIndicator.present();
    }
  }

  async hideLoadingIndicator() {
    if (this.loadingIndicator) {
      await this.loadingIndicator.dismiss();
      this.loadingIndicator = null;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.getElementById('monthly-transactions-' + this.selectedYear).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      setTimeout(() => {
        document.getElementById('monthly-transactions-' + this.selectedMonth).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
        this.hideLoadingIndicator();
      }, 1500);
    }, 1500);
  }

  getYearsList() {
    const startYear = new Date().getFullYear() - 30;
    const endYear = new Date().getFullYear() + 30;
    for (let i = startYear; i < endYear; i++) {
      this.years.push({
        id: i.toString(),
        label: i.toString()
      });
    }
  }

  async updateSettlement(breakUp: any) {
    if (this.isDataInit) {
      console.log(breakUp);
      this.isDataInit = false;
      if (breakUp.id && !breakUp.isSettled) {
        const loading = await this.loadingController.create({message: 'Please wait...'});
        await loading.present();
        const data = await this.settlementsCollection.doc(breakUp.id).delete();
        await loading.dismiss();
      } else {
        const loading = await this.loadingController.create({message: 'Please wait...'});
        await loading.present();
        const data = await this.settlementsCollection.add({transactionId: breakUp.transactionId, dueOn: breakUp.dueOn});
        await loading.dismiss();
      }
    }
  }
}
