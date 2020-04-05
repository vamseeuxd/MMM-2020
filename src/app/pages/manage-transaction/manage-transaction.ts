import {Component} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {AlertController, LoadingController, ModalController, NavParams, ToastController} from '@ionic/angular';
import {Transaction} from '../../models/Transaction';
import {getRecurringTransactionTitle} from '../../utils/mmm-utils';

@Component({
  selector: 'page-speaker-list',
  templateUrl: 'manage-transaction.html',
  styleUrls: ['./manage-transaction.scss'],
})
export class ManageTransactionPage {
// ManageTransaction
  private transactionsCollection: AngularFirestoreCollection<Transaction> = this.firestore.collection<any>('transactions');
  data: Transaction;
  isUpdate = false;
  maxDate;
  minDate;

  constructor(
    public toastCtrl: ToastController,
    public fireAuth: AngularFireAuth,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    private firestore: AngularFirestore
  ) {
    this.data = this.navParams.get('transactionDetails') as Transaction;
    this.isUpdate = this.navParams.get('isUpdate');
    this.setMinMaxDates();
  }

  setMinMaxDates() {
    const maxDate = new Date();
    maxDate.setFullYear(new Date().getFullYear() + 30);
    this.maxDate = maxDate.toISOString();

    const minDate = new Date();
    minDate.setFullYear(new Date().getFullYear() - 30);
    this.minDate = minDate.toISOString();
  }

  resetInterval(intervalController) {
    this.data.interval = 1;
    setTimeout(() => {
      intervalController.open();
    });
  }

  getIntervalOptions(repeat: string) {
    let endIndex = 0;
    let singularLabel = '';
    let pluralLabel = '';
    switch (repeat) {
      case 'never':
        endIndex = 0;
        break;
      case 'daily':
        endIndex = 30;
        singularLabel = 'Day';
        pluralLabel = 'Days';
        break;
      case 'weekly':
        endIndex = 52;
        singularLabel = 'Week';
        pluralLabel = 'Weeks';
        break;
      case 'monthly':
        endIndex = 12;
        singularLabel = 'Month';
        pluralLabel = 'Months';
        break;
      case 'yearly':
        endIndex = 10;
        singularLabel = 'Year';
        pluralLabel = 'Years';
        break;
    }
    const returnData = [];
    for (let i = 1; i <= endIndex; i++) {
      if (i === 1) {
        returnData.push({value: i, label: `Every ${singularLabel}`});
      } else {
        returnData.push({value: i, label: `Every ${i} ${pluralLabel}`});
      }
    }
    return returnData;
  }

  async saveDataOnConfirmation(item: Transaction, userUid) {
    item.userUid = userUid;
    if (item.repeat === 'never') {
      const startDate = new Date(item.startDate);
      item.startDate = `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`;
      item.endDate = `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`;
    } else {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      item.startDate = `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`;
      item.endDate = `${endDate.getMonth() + 1}-${endDate.getDate()}-${endDate.getFullYear()}`;
    }
    if (this.isUpdate) {
      this.saveExistingData(item);
    } else {
      this.saveNewData(item);
    }
  }

  async saveExistingData(item) {
    const loading = await this.loadingController.create({message: 'Please wait...'});
    await loading.present();
    this.transactionsCollection.doc(this.data.id).set(item).then(async value => {
      await loading.dismiss();
      this.dismiss(this.data);
      const toast = await this.toastCtrl.create({
        header: `Transaction was successfully updated.`,
        duration: 3000,
        buttons: [{
          text: 'Close',
          role: 'cancel'
        }]
      });
      await toast.present();
    }, async reason => {
      await loading.dismiss();
      console.log(reason);
    });
  }

  async saveNewData(item) {
    const loading = await this.loadingController.create({message: 'Please wait...'});
    await loading.present();
    this.transactionsCollection.add(item).then(async value => {
      await loading.dismiss();
      this.dismiss(this.data);
      const toast = await this.toastCtrl.create({
        header: `New Transaction was successfully added.`,
        duration: 3000,
        buttons: [{
          text: 'Close',
          role: 'cancel'
        }]
      });
      await toast.present();
    }, async reason => {
      await loading.dismiss();
      console.log(reason);
    });
  }

  async saveData(item: any, userUid) {
    if (new Date(item.startDate) <= new Date(item.endDate)) {
      const alert = await this.alertController.create({
        header: 'Save Confirmation',
        message: 'Are you sure! do you want to save this Transaction?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Okay',
            handler: () => {
              this.saveDataOnConfirmation(item, userUid);
            }
          }
        ]
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Invalid Dates',
        message: 'End Date should be greater than Start Date?',
        buttons: [{
          text: 'Okay'
        }
        ]
      });
      await alert.present();
    }
  }

  getSubTitle(repeat, type, interval) {
    return getRecurringTransactionTitle(repeat, type, interval);
  }

  resetData() {
    this.data = {
      label: '',
      repeat: 'never',
      startDate: new Date().toDateString(),
      interval: 1,
      amount: 20000,
      type: 'income',
      remarks: 'remarks',
      endDate: new Date().toDateString(),
      userUid: '',
      isTaxSavings: false,
      id: '',
    };
  }

  dismiss(data?: Transaction) {
    this.modalCtrl.dismiss(data);
  }

  async deleteTransaction() {
    const alert = await this.alertController.create({
      header: 'Save Confirmation',
      message: 'Are you sure! do you want to delete Transaction?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: async () => {
            const loading = await this.loadingController.create({message: 'Please wait...'});
            await loading.present();
            this.transactionsCollection.doc(this.data.id).delete().then(async value => {
              await loading.dismiss();
              this.dismiss(this.data);
              const toast = await this.toastCtrl.create({
                header: `New Transaction was successfully Deleted.`,
                duration: 3000,
                buttons: [{
                  text: 'Close',
                  role: 'cancel'
                }]
              });
              await toast.present();
            }, async reason => {
              await loading.dismiss();
              console.log(reason);
            });
          }
        }
      ]
    });
    await alert.present();

  }
}
