interface AuthConfig {
  clientID: string;
  domain: string;
  callbackURL: string;
  silentCallbackURL: string;
  audience: string;
  apiUrl: string;
}

export const AUTH_CONFIG: AuthConfig = {
  clientID: 'ymWDQhg9YJKG3mkeCeoTJ5ObB43Z3Ocy',
  domain: 'dev-967p-ca5.us.auth0.com',
  callbackURL: 'http://localhost:4200/callback',
  silentCallbackURL: 'http://localhost:4200/silent',
  audience: 'http://localhost:4200',
  apiUrl: 'https://localhost:3000'
};
