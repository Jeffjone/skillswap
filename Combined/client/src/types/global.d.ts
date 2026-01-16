import { FirebaseApp } from 'firebase/app';
import { Functions, HttpsCallable } from 'firebase/functions';
import { Auth } from 'firebase/auth';

declare global {
    interface Window {
        firebase: FirebaseApp & {
            functions: () => Functions & {
                httpsCallable: <T = any, R = any>(name: string) => HttpsCallable<T, R>;
            };
            auth: () => Auth;
        };
    }
} 