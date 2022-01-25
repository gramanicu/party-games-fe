<script>
    import '$scss/app.scss';
    import CloseSvg from '$components/svg/CloseSvg.svelte';
    import HamburgerSvg from '$components/svg/Hamburger.svelte';
    import TextLogo from '$components/branding/TextLogo.svelte';
    import DownSvg from '$components/svg/DownSvg.svelte';
    import { jwt, role, username } from '$stores/authentication';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { callBackend, roleFromEnum } from '$lib/backend';

    let userRole;

    onMount(() => {
        if (!$jwt) {
            goto('/auth/signin');
            return;
        }

        userRole = roleFromEnum($role);
        const html_tag = document.body.parentNode;

        switch (userRole) {
            case 0:
                html_tag.dataset.theme = 'cupcake';
                break;
            case 1:
                html_tag.dataset.theme = 'halloween';
                break;
            case 2:
                html_tag.dataset.theme = 'corporate';
                break;
            default:
                html_tag.dataset.theme = 'cyberpunk';
                break;
        }

        const verifyJWT = setInterval(async () => {
            try {
                const res = await callBackend('/auth/refresh', 'GET');

                $jwt = res;
            } catch (err) {
                $jwt = null;
                $role = null;
                $username = null;
                clearInterval(verifyJWT);
                goto('/auth/signin');
                return;
            }
        }, 1000 * 60);
    });

    function signout() {
        $jwt = null;
        $role = null;
        $username = null;
        goto('/');
    }

    const navItems = [{ label: 'Users', href: '/home/users', role: 0 }];
</script>

<div class="drawer drawer-mobile h-screen">
    <!-- Drawer toggler (hidden) -->
    <input id="layoutDrawer" type="checkbox" class="drawer-toggle" />

    <!-- Drawer content -->
    <main class="flex-grow flex flex-col h-screen overflow-hidden bg-base-100 text-base-content drawer-content">
        <!-- The navbar -->
        <div class="sticky inset-x-0 top-0 z-50 navbar bg-base-100  border-b border-base-300">
            <div class="lg:hidden navbar-start">
                <label for="layoutDrawer" class="btn btn-square btn-ghost">
                    <HamburgerSvg />
                </label>

                <TextLogo />
            </div>

            <div class="navbar-end lg:justify-self-end lg:w-full hidden lg:flex flex-row gap-1">
                <!-- Logged In Username -->
                <p>{$username}</p>
                <!-- User dropdown menu -->
                <div class="dropdown dropdown-end">
                    <div tabindex="0" class="btn btn-circle btn-ghost btn-xs text-info">
                        <DownSvg />
                    </div>

                    <!-- Logout button -->
                    <div
                        tabindex="0"
                        class="shadow-lg border border-gray-300 card compact dropdown-content bg-base-100 rounded-box p-2 gap-1 menu">
                        <!-- <a
                            class="p-2 bg-base-100 hover:bg-base-300 rounded-lg whitespace-nowrap"
                            href="/account/settings"><p>Settings</p></a> -->
                        <button
                            class="p-2 bg-base-100 hover:bg-base-300 rounded-lg whitespace-nowrap"
                            on:click={signout}>Sign Out</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- The page contents -->
        <div class=" flex-grow">
            <slot />
        </div>
    </main>

    <!-- The mobile sidebar -->
    <div class="drawer-side border-r border-base-300">
        <label for="layoutDrawer" class="drawer-overlay border-b border-base-300" />
        <aside class="flex flex-col text-base-content w-80 bg-base-100 justify-items-stretch">
            <div
                class="sticky inset-x-0 top-0 z-50 w-full px-4 min-h-16 flex flex-row justify-between items-center border-b border-base-300 bg-base-100">
                <!-- Sidebar title -->
                <TextLogo />

                <!-- Hide sidebar button -->
                <div class="flex-none lg:hidden">
                    <label for="layoutDrawer" class="btn btn-square btn-ghost">
                        <CloseSvg />
                    </label>
                </div>
            </div>
            <!-- Navigation links -->
            <div class="flex-grow">
                <ul class="menu flex flex-col pt-2 w-80 bg-base-100 text-lg p-4">
                    {#each navItems as link}
                        {#if link.role == userRole}
                            <li>
                                <a
                                    href={link.href}
                                    on:click={() => {
                                        document.getElementById('layoutDrawer').click();
                                    }}>{link.label}</a>
                            </li>
                        {/if}
                    {/each}
                </ul>
            </div>

            <!-- Auth Links -->
            <div class="flex lg:hidden flex-col w-full p-2 border-t rounded justify-self-end">
                <!-- Logout button -->
                <div class="flex flex-row justify-center items-center">
                    <button class="btn btn-ghost btn-sm rounded-btn" on:click={signout}>Sign Out</button>
                </div>
            </div>
        </aside>
    </div>
</div>

<style lang="scss">
    .drawer-toggle {
        display: none;

        &:checked ~ .drawer-side {
            overflow: hidden;
        }
    }

    .drawer-side {
        overflow-x: hidden;
    }

    .dropdown-content.menu {
        min-width: 12rem;
    }
</style>
