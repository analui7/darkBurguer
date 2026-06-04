import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environments';

export const firebaseApp = initializeApp(environment.firebaseConfig);