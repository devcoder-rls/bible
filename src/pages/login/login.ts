import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Auth, Logger } from 'aws-amplify';

const logger = new Logger('Login');

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {}

  loginGoogle() {
    let loading = this.loadingCtrl.create({
      content: 'Carregando...'
    });

    loading.present();

    logger.info('login..');

    /*const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn()
        .then(googleUser => {

		    const { id_token, expires_at } = googleUser.getAuthResponse();

		    Auth.federatedSignIn('google',  token: id_token, expires_at }, user)
		      .then(credentials => {
		        logger.debug('signed in user', credentials);

		        // TODO
		      })
		      .catch(err => logger.debug('errrror', err))
		     .then(() => loading.dismiss());

        });*/

    //let user = await Auth.currentUser()
  }
}
