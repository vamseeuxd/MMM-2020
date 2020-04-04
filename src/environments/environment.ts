// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyACOn44QuidS8h913zR9ZicnHdnRO3B1RM',
    authDomain: 'monthly-money-manager-d772a.firebaseapp.com',
    databaseURL: 'https://monthly-money-manager-d772a.firebaseio.com',
    projectId: 'monthly-money-manager-d772a',
    storageBucket: 'monthly-money-manager-d772a.appspot.com',
    messagingSenderId: '203388440833',
    appId: '1:203388440833:web:4ff1ae03fdaf3296868b00'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
