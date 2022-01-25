<script>
    import AddSvg from '$components/svg/AddSvg.svelte';
    import CloseSvg from '$components/svg/CloseSvg.svelte';
    import TableInputEmail from '$components/table/TableInputEmail.svelte';
    import TableInputText from '$components/table/TableInputText.svelte';
    import { callBackend, roleToEnum, roleToString } from '$lib/backend';
    import { roleFromEnum } from '$lib/backend';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { role, username as loggedname } from '$stores/authentication';

    onMount(async () => {
        let userRole = roleFromEnum($role);
        if (!(userRole == 0)) {
            goto('/home');
            return;
        }

        try {
            const res = await callBackend('/auth/get-all-users', 'GET');
            res.forEach(user => {
                user.role = roleFromEnum(user.role);
                users = [...users, { ...user }];
            });
        } catch (err) {
            console.error(err);
        }
    });

    let users = [];
    let newUsers = [];
    let deletedUsers = [];

    let newUser = {
        id: null,
        username: null,
        email: null,
        firstName: null,
        lastName: null,
        password: null,
        role: '1',
    };

    /**
     * Edit a users role
     * @param username The username of the user to change
     * @param role_id The new role of that user
     */
    async function changeUserRole(username, role_id) {
        if ($loggedname == username) return;

        users.find(user => user.username == username).role = role_id;

        // This is done to update DOM
        users = users;
    }

    /**
     * Marks a user for deletion (removes it from the table and adds him to the list for deleted users)
     * @param username The username of the user to delete
     */
    async function removeUser(username) {
        if ($loggedname == username) return;
        let d_user = users.find(user => user.username == username);

        if (!d_user) {
            d_user = newUsers.find(user => user.username == username);

            if (!d_user) {
                return;
            }

            newUsers = newUsers.filter(user => user.username != username);
        } else {
            // Only the users that already existed need to be added to the deleted users list
            users = users.filter(user => user.username != username);
            deletedUsers.push(d_user);
        }
    }

    /**
     * Add a new user to the list. (he will be added to the new user list)
     * The user list stores users that can be modified (put route), the new user lists stores the new users (post route)
     */
    async function addUser() {
        if (newUser.username == null) newUser.username = 'john_doe';
        if (newUser.email == null) newUser.email = 'john.doe@stud.acs.upb.ro';
        if (newUser.firstName == null) newUser.firstName = 'John';
        if (newUser.lastName == null) newUser.lastName = 'Doe';
        if (newUser.role == null) newUser.role = '1';

        newUser.password = '12345678';

        let full_users = [...users, ...newUsers];

        if (!full_users.find(user => user.username == newUser.username || user.email == newUser.email)) {
            newUsers = [...newUsers, { ...newUser }];

            newUser = {
                id: null,
                username: null,
                email: null,
                firstName: null,
                lastName: null,
                role: '1',
            };
        } else {
            alert('Username or Email already in use');
        }
    }

    /**
     * Add a new user request
     * @param user The new user
     */
    async function sendNewUser(user) {
        delete user['id'];
        try {
            user.role = roleToEnum(user.role);
            const res = await callBackend('/auth/register', 'POST', user);
        } catch (err) {
            console.error(err);
        }
    }

    async function sendEditUser(user) {
        delete user['id'];
        try {
            user.role = roleToEnum(user.role);
            const res = await callBackend(`/auth/update-user/?username=${user.username}`, 'PUT', user);
        } catch (err) {
            console.error(err);
        }
    }
    async function sendDeleteUser(user) {
        delete user['id'];
        try {
            const res = await callBackend(`/auth/delete-user/?username=${user.username}`, 'DELETE');
        } catch (err) {
            console.error(err);
        }
    }

    async function refreshTable() {
        try {
            const res = await callBackend('/auth/get-all-users', 'GET');
            users = [];
            newUsers = [];
            deletedUsers = [];
            res.forEach(user => {
                user.role = roleFromEnum(user.role);
                users = [...users, { ...user }];
            });
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Save all the modifications done in the table
     */
    async function save() {
        for (const user of users) {
            await sendEditUser(user);
        }

        for (const user of newUsers) {
            await sendNewUser(user);
        }

        for (const user of deletedUsers) {
            await sendDeleteUser(user);
        }

        await refreshTable();
    }
</script>

<div class="w-full overflow-x-auto min-h-full">
    <div class="p-4">
        <button on:click={save} class="btn btn-outline btn-success btn-block">Save</button>
    </div>

    <table class="table w-full border border-base-300">
        <thead>
            <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th class="hidden lg:table-cell">First Name</th>
                <th class="hidden lg:table-cell">Last Name</th>
                <th>Role</th>
                <th />
            </tr>
        </thead>
        <tbody>
            <!-- Add new user row -->
            <tr class="active">
                <td class="sticky left-0 z-10" />
                <td>
                    <TableInputText
                        class="input-primary"
                        bind:value={newUser.username}
                        name="username"
                        placeholder="Username" />
                </td>
                <td>
                    <TableInputEmail
                        class="input-primary"
                        bind:value={newUser.email}
                        name="email"
                        placeholder="Email" />
                </td>
                <td class="hidden lg:table-cell">
                    <TableInputText
                        class="input-primary"
                        bind:value={newUser.firstName}
                        name="First Name"
                        placeholder="First Name" />
                </td>
                <td class="hidden lg:table-cell">
                    <TableInputText
                        class="input-primary"
                        bind:value={newUser.lastName}
                        name="Last Name"
                        placeholder="Last Name" />
                </td>
                <td class="dropdown">
                    <div tabindex="0" class="badge-lg badge cursor-pointer capitalize">
                        {roleToString(newUser.role)}
                    </div>
                    <div
                        tabindex="0"
                        class="shadow-lg border mt-1 border-gray-300 card compact dropdown-content bg-base-100 rounded-box p-2 gap-1 menu">
                        {#each Array(3) as _, role_id}
                            <div
                                class="p-2 bg-base-100 cursor-pointer capitalize hover:bg-base-300 rounded-lg whitespace-nowrap"
                                on:click={() => {
                                    newUser.role = role_id;
                                }}>
                                {roleToString(role_id)}
                            </div>
                        {/each}
                    </div>
                </td>
                <td on:click={addUser} class="sticky left-0 z-10 cursor-pointer text-white bg-neutral"><AddSvg /></td>
            </tr>

            {#each [...users, ...newUsers] as user, index}
                <tr class="">
                    <td class="sticky left-0 z-10">{index}</td>
                    <td
                        ><TableInputText
                            disabled="true"
                            class="cursor-default"
                            bind:value={user.username}
                            name="username"
                            placeholder="Username" /></td>
                    <td>
                        <TableInputEmail
                            bind:value={user.email}
                            disabled="true"
                            class="cursor-default"
                            name="email"
                            placeholder="Email" />
                    </td>
                    <td class="hidden lg:table-cell"
                        ><TableInputText bind:value={user.firstName} name="First Name" placeholder="First Name" /></td>
                    <td class="hidden lg:table-cell"
                        ><TableInputText bind:value={user.lastName} name="Last Name" placeholder="Last Name" /></td>

                    <td class="dropdown">
                        <div tabindex="0" class="badge-lg badge cursor-pointer capitalize">
                            {roleToString(user.role)}
                        </div>
                        {#if $loggedname != user.username}
                            <div
                                tabindex="0"
                                class="shadow-lg mt-1 border border-gray-300 card compact dropdown-content bg-base-100 rounded-box p-2 gap-1 menu">
                                {#each Array(3) as _, role_id}
                                    <div
                                        class="p-2 bg-base-100 cursor-pointer capitalize hover:bg-base-300 rounded-lg whitespace-nowrap"
                                        on:click={() => changeUserRole(user.username, role_id)}>
                                        {roleToString(role_id)}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </td>
                    {#if $loggedname != user.username}
                        <td class="sticky left-0 z-10 cursor-pointer text-red-900" on:click={removeUser(user.username)}
                            ><CloseSvg /></td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
    table.table {
        overflow-x: auto;
    }

    td.dropdown {
        display: table-cell;
    }

    * :global(.cursor-default) {
        cursor: default !important;
    }
</style>
