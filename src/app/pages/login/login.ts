import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  constructor(
    public router: Router,
    public fireAuth: AngularFireAuth
  ) {
  }

  login() {
    this.fireAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(res => this.router.navigateByUrl('/app/tabs/transaction-list'));
  }

  logout() {
    this.fireAuth.auth.signOut();
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
