import { writable } from 'svelte/store';
import { browser } from '$app/env';

export const username = writable((browser && localStorage.getItem('username')) || null);
export const role = writable((browser && localStorage.getItem('role')) || null);
export const jwt = writable((browser && localStorage.getItem('jwt')) || null);
export const backUrl = writable('');

function updateLocalStorage(key, val) {
    if (browser) {
        if (val != null) {
            localStorage.setItem(key, val);
        } else {
            localStorage.removeItem(key);
        }
    }
}

username.subscribe(val => updateLocalStorage('username', val));
role.subscribe(val => updateLocalStorage('role', val));
jwt.subscribe(val => updateLocalStorage('jwt', val));
