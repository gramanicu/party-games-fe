import { vars } from '$lib/variables';
import { jwt } from '$stores/authentication';
import { get } from 'svelte/store';

/**
 * Calls the backend routes
 * @param {String} route The route name (/x/y/...)
 * @param {String} method The HTTP method
 * @param {JSON} body The HTTP Body (optional)
 * @param {JSON} headers The HTTP Headers (optional)
 * @returns The JSON response from the backend
 */
export async function callBackend(route, method, body, headers) {
    if (body) {
        body = JSON.stringify(body);

        headers = {
            ...headers,
            'Content-Length': body.length,
            'Content-Type': 'application/json',
        };
    }

    if (get(jwt) != null) {
        headers = {
            ...headers,
            Authorization: `Bearer ${get(jwt)}`,
        };
    }

    const url = vars.baseApiUrl + route;
    const res = await fetch(url, {
        method,
        headers,
        body,
    });

    if (!res.ok) throw new Error(await res.text());

    const contentType = res.headers.get('content-type');

    if (contentType && contentType.indexOf('application/json') !== -1) {
        return res.json();
    } else {
        return res.text();
    }
}

/**
 * Get the role of a user as a string
 * @param {Number} role_id The id of the role
 * @returns A string with the name of the role
 */
export function roleToString(role_id) {
    switch (Number(role_id)) {
        case 0:
            return 'admin';
        case 1:
            return 'professor';
        case 2:
            return 'student';
    }
}

/**
 * Returns the role in a backend compatible format
 * @param {Number} role_id The id of the role (frontend only)
 * @returns The string used in the backend enum
 */
export function roleToEnum(role_id) {
    switch (Number(role_id)) {
        case 0:
            return 'ROLE_ADMIN';
        case 1:
            return 'ROLE_TEACHER';
        case 2:
            return 'ROLE_STUDENT';
    }
}

/**
 * Converts the role from enum format (backend) to its id
 * @param {String} role_string The role in backend format
 * @returns The role_id (frontend format)
 */
export function roleFromEnum(role_string) {
    switch (role_string) {
        case 'ROLE_ADMIN':
            return 0;
        case 'ROLE_TEACHER':
            return 1;
        case 'ROLE_STUDENT':
            return 2;
    }
}
