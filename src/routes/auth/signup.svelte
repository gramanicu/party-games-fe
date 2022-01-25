<script>
    import FormInputText from '$components/forms/FormInputText.svelte';
    import FormInputEmail from '$components/forms/FormInputEmail.svelte';
    import FormInputPassword from '$components/forms/FormInputPassword.svelte';
    import FormLink from '$components/forms/FormLink.svelte';
    import FormButton from '$components/forms/FormButton.svelte';
    import { callBackend, roleToEnum } from '$lib/backend';
    import { jwt, role, username } from '$stores/authentication';
    import { goto } from '$app/navigation';

    let confirmPassword = null;
    let user = {
        username: null,
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        enabled: true,
        role: 2,
    };

    function validateEmail(email) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function isValid() {
        if (!validateEmail(user.email)) {
            return false;
        }

        if (!(user.username && user.firstName && user.lastName && user.password)) {
            return false;
        }
        if (!(user.password === confirmPassword)) {
            return false;
        }

        return true;
    }

    async function signup() {
        if (typeof user.role == 'number') {
            user.role = roleToEnum(user.role);
        }

        if (isValid()) {
            try {
                let res = await callBackend('/auth/register', 'POST', user);

                $jwt = res;

                res = await callBackend('/auth/get-user-details', 'GET');

                $role = res.role;
                $username = res.username;
                goto('/home');
            } catch (err) {
                $jwt = null;
                $role = null;
                $username = null;
                console.error(err);
            }
        }
    }
</script>

<div class="flex flex-col justify-center items-center w-full h-full screen-container">
    <div
        class="login-reg-container rounded-lg max-w-md w-full p-8 pt-6 border-2 shadow-2xl bg-base-100 border-base-300">
        <h1 class="font-medium text-xl text-center mb-2">Sign Up</h1>
        <FormInputText bind:value={user.username} name="username" placeholder="Username" label="Username" />
        <div class="grid grid-cols-1 md:grid-cols-2  w-full gap-0 md:gap-4">
            <FormInputText bind:value={user.firstName} name="first_name" placeholder="First Name" label="First Name" />
            <FormInputText bind:value={user.lastName} name="last_name" placeholder="Last Name" label="Last Name" />
        </div>
        <FormInputEmail bind:value={user.email} name="email" placeholder="Email" label="Email" />
        <span class="mb-4 block" />
        <FormInputPassword
            bind:value={user.password}
            error={!user.password || !confirmPassword || user.password === confirmPassword
                ? null
                : 'Passwords do not match.'}
            id="password"
            name="password"
            placeholder="Password"
            label="Password" />
        <FormInputPassword
            bind:value={confirmPassword}
            error={!user.password || !confirmPassword || user.password === confirmPassword
                ? null
                : 'Passwords do not match.'}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            label="Confirm password" />
        <FormButton on:click={signup} class="mt-8" text="Register" />
        <div class="mt-5 text-center">
            <p>
                Registered already?
                <FormLink url="/auth/signin" text="Log In" />
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    div.screen-container {
        background: #ffffff;
        background: linear-gradient(135deg, hsla(var(--n)) -10%, hsla(var(--p)) 70%, hsla(var(--pf)) 105%);
    }
</style>
