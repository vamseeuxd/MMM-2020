import {Component} from '@angular/core';
import {Config, LoadingController, ModalController, NavParams} from '@ionic/angular';

import {ConferenceData} from '../../providers/conference-data';
import {Transaction} from '../../models/Transaction';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {map, switchMap, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';


@Component({
  selector: 'page-schedule-filter',
  templateUrl: 'transaction-breakup-list.html',
  styleUrls: ['./transaction-breakup-list.scss'],
})
export class TransactionBreakupListPage {
  ios: boolean;
  private settlementsCollection: AngularFirestoreCollection<any> = this.firestore.collection<any>('settlements');
  settlements$;
  finalSettlements$;
  data: Transaction;
  isUpdate = false;
  isDataInit = false;

  constructor(
    public confData: ConferenceData,
    private config: Config,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    private firestore: AngularFirestore,
    public loadingController: LoadingController,
  ) {
    this.data = this.navParams.get('transactionDetails') as Transaction;
    this.isUpdate = this.navParams.get('isUpdate');
    this.settlements$ = this.firestore
      .collection<any>('settlements', ref => ref.where('transactionId', '==', this.data.id))
      .snapshotChanges()
      .pipe(
        map(settlements => settlements.map(
          settlement => {
            const data = settlement.payload.doc.data();
            const id = settlement.payload.doc.id;
            return {id, ...data};
          }))
      );
    this.finalSettlements$ = this.settlements$.pipe(
      switchMap(
        (settlements: any[]) => {
          this.isDataInit = false;
          const mappedSettlements = this.data.breakups.map(breakup => {
            const isSettled = settlements.map(s => s.dueOn).includes(breakup.dueOn);
            if (isSettled) {
              const id = settlements.find(s => (s.dueOn === breakup.dueOn)).id;
              return {...breakup, isSettled, id};
            } else {
              return breakup;
            }
          });
          return of(mappedSettlements);
        }
      ),
    ).pipe(
      tap((d: any[]) => {
        setTimeout(() => {
          this.isDataInit = true;
        }, 50);
      })
    );
  }

  ionViewWillEnter() {
    this.ios = this.config.get('mode') === `ios`;
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  getSubTitle() {
    switch (this.data.repeat) {
      case 'never':
        return `this is only time ${this.data.type}`;
        break;
      case 'daily':
        return `this ${this.data.type} is for every ${this.data.interval}  days`;
        break;
      case 'weekly':
        return `this ${this.data.type} is for every ${this.data.interval}  weeks`;
        break;
      case 'monthly':
        return `this ${this.data.type} is for every ${this.data.interval}  months`;
        break;
      case 'yearly':
        return `this ${this.data.type} is for every ${this.data.interval}  years`;
        break;
    }
  }

  saveBreakups() {
    console.log(JSON.stringify(this.data.breakups, null, 2));
  }

  async updateSettlement(breakUp: any) {
    if(this.isDataInit) {
      if (breakUp.id && !breakUp.isSettled) {
        const loading = await this.loadingController.create({message: 'Please wait...'});
        await loading.present();
        const data = await this.settlementsCollection.doc(breakUp.id).delete();
        await loading.dismiss();
      } else {
        const loading = await this.loadingController.create({message: 'Please wait...'});
        await loading.present();
        const data = await this.settlementsCollection.add({transactionId: this.data.id, dueOn: breakUp.dueOn});
        await loading.dismiss();
      }
    }
  }
}
