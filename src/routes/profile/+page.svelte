<script>
  import { SignIn, SignOut } from "@auth/sveltekit/components"
  import { page } from "$app/state"
</script>

<h1>Profile</h1>


{#if page.data.session}
  <span class="signedInText">
    <small>Signed in as</small><br />
    <strong>{page.data.session.user?.name ?? "User"}</strong>
    </span
  >
  <SignOut>
    <div slot="submitButton" class="btn">Sign Out</div>
  </SignOut>
{:else}
  <span>You are not signed in</span>
  <SignIn provider="Google"/>
{/if}