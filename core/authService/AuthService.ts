import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';

type AuthEvents = {
  login: (user: User) => void;
  logout: () => void;
};

class AuthService extends (EventEmitter as new () => TypedEmitter<AuthEvents>) {
  login(user: User) {
    this.emit('login', user);
  }
  logout() {
    this.emit('logout');
  }
}

const auth = new AuthService();
auth.on('login', (u) => console.log('User logged in:', u));
