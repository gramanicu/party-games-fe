<script>
    import FormInputPassword from '$components/forms/FormInputPassword.svelte';
    import FormCheckbox from '$components/forms/FormCheckbox.svelte';
    import FormButton from '$components/forms/FormButton.svelte';
    import FormLink from '$components/forms/FormLink.svelte';
    import { callBackend } from '$lib/backend';
    import FormInputText from '$components/forms/FormInputText.svelte';
    import { backUrl, jwt, role, username } from '$stores/authentication';
    import { goto } from '$app/navigation';

    let user = {
        username: null,
        password: null,
    };

    async function signin() {
        if (user.username == null || user.password == null) return;

        const url = `/auth/login?username=${user.username}&password=${user.password}`;

        try {
            let res = await callBackend(url, 'GET');
            $jwt = res;

            res = await callBackend('/auth/get-user-details', 'GET');

            $role = res.role;
            $username = res.username;

            if ($backUrl) {
                let url = $backUrl;
                $backUrl = null;
                console.log(url);
                goto(url);
            } else {
                goto('/home');
            }
        } catch (err) {
            $jwt = null;
            $role = null;
            $username = null;
            alert('Invalid Credentials');
            console.error(err);
        }
    }
</script>

<div class="flex flex-col justify-center items-center w-full h-full screen-container">
    <div class="login-reg-container rounded-lg w-96 p-8 pt-6 border-2 shadow-2xl bg-base-100 border-base-300">
        <h1 class="font-medium text-xl text-center mb-2">Sign In</h1>

        <!-- <FormInputText placeholder="Username" label="Username" /> -->
        <FormInputText bind:value={user.username} name="username" placeholder="Username" label="Username" />
        <FormInputPassword bind:value={user.password} name="password" placeholder="Password" label="Password" />
        <div class="flex flex-row w-full mt-4">
            <div class="flex flex-row text-center items-center w-1/2">
                <FormCheckbox text="Remember me?" name="remember" />
            </div>
            <div class="text-right flex flex-row items-center justify-end w-1/2">
                <FormLink url="#" text="Forgot password?" />
            </div>
        </div>
        <FormButton on:click={signin} class="mt-6" text="Login" />
        <div class="mt-5 text-center">
            <p>
                Not registered?
                <FormLink url="/auth/signup" text="Register now" />
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
