import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  AlertController,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
  Config,
} from '@ionic/angular';

import {ConferenceData} from '../../providers/conference-data';
import {UserData} from '../../providers/user-data';
import {AngularFireAuth} from '@angular/fire/auth';
import {ManageTransactionPage} from '../manage-transaction/manage-transaction';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Transaction} from '../../models/Transaction';
import {BehaviorSubject, Observable, of, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {RecurringTransactions} from '../../utils/recurring-transactions';
import {TransactionBreakupListPage} from '../transaction-breakup-list/transaction-breakup-list';
import {getRecurringTransactionTitle} from '../../utils/mmm-utils';

export interface TransactionId extends Transaction {
  id: string;
}

@Component({
  selector: 'page-schedule',
  templateUrl: 'transaction-list.html',
  styleUrls: ['./transaction-list.scss'],
})
export class TransactionListPage implements OnInit {
  ios = false;
  transactionType = 'income';
  transactionTypeAction: BehaviorSubject<string> = new BehaviorSubject<string>(this.transactionType);
  transactionType$ = this.transactionTypeAction.asObservable();

  private transactionsCollection: AngularFirestoreCollection<Transaction>;
  private recurringTransactions: RecurringTransactions = new RecurringTransactions();
  transactions$: Observable<TransactionId[]> = combineLatest(this.fireAuth.user, this.transactionType$).pipe(
    switchMap(([user, transactionType]) => {
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
    })
  );

  breakUps$ = this.transactions$.pipe(
    switchMap(transactions => {
      return of(transactions.map(
        transaction => {
          return {
            ...transaction,
            breakups: this.recurringTransactions.getTransactionBreakups(transaction)
          };
        }
        )
      );
    })
  );


  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public user: UserData,
    public fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    public config: Config
  ) {
    this.fireAuth.auth.onAuthStateChanged(userDetails => {
      if (!userDetails) {
        this.router.navigateByUrl('/login');
      }
    });
    this.transactionsCollection = firestore.collection<any>('transactions');
  }

  ngOnInit() {
    this.ios = this.config.get('mode') === 'ios';
  }

  getNewTransactionDetails() {
    return {
      label: '',
      repeat: 'monthly',
      startDate: null,
      interval: 1,
      amount: 0,
      type: this.transactionType,
      remarks: 'remarks',
      endDate: null,
      isTaxSavings: false,
      userUid: '',
      id: '',
    };
  }

  getTransactionSubTitle(repeat, type, interval) {
    return getRecurringTransactionTitle(repeat, type, interval);
  }

  async presentTransactionBreakups(transactionDetails, isUpdate: boolean, slidingItem) {
    if (slidingItem) {
      await slidingItem.closeOpened();
    }
    const modal = await this.modalCtrl.create({
      component: TransactionBreakupListPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        transactionDetails,
        isUpdate
      }
    });
    await modal.present();

    const {data} = await modal.onWillDismiss();
    if (data) {
      /*
      this.excludeTracks = data;
      this.updateSchedule();
      */
    }
  }

  async presentAddNewTransaction(transactionDetails, isUpdate: boolean, slidingItem) {
    if (slidingItem) {
      await slidingItem.closeOpened();
    }
    const modal = await this.modalCtrl.create({
      component: ManageTransactionPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        transactionDetails,
        isUpdate
      }
    });
    await modal.present();

    const {data} = await modal.onWillDismiss();
    if (data) {
      /*
      this.excludeTracks = data;
      this.updateSchedule();
      */
    }
  }

  updateTransactionType() {
    this.transactionTypeAction.next(this.transactionType);
  }
}

/*[
    {
      "id": "o7lkdlZ0xgWIRtN1ZtRJ",
      "amount": 250000,
      "endDate": "12-2-2020",
      "interval": 1,
      "isTaxSavings": true,
      "label": "Test 123",
      "remarks": "remarks",
      "repeat": "monthly",
      "startDate": "1-2-2020",
      "type": "income",
      "userUid": "100105445848125370945"
    }
    ]*/
