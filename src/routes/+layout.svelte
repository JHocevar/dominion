<script lang="ts">
  import { onMount } from "svelte"
  import { loadAll } from "$lib/functions/saving"
  import "$lib/assets/global.css"
  import favicon from "$lib/assets/favicon.ico"
  import { page } from "$app/state"
  import ConflictDialog from "$lib/components/ConflictDialog.svelte"
  import { conflictState } from "$lib/state/conflicts.svelte"
  import { settingsState } from "$lib/state/settings.svelte"

  let { children } = $props()
  let isMenuOpen = $state(false)
  let isDark = $state(true)
  const loggedIn = $derived.by(() => !!page.data?.session?.user?.id)
  const username = $derived.by(() => page.data?.session?.user?.name ?? "")
  const hasQueryParamForLoadingKingdom = $derived.by(() => page.url.searchParams.get('kingdomId') !== '')

  function toggleMenu() {
    isMenuOpen = !isMenuOpen
  }

  function applyTheme(isDark: boolean) {
    document
      .getElementById("html")
      ?.setAttribute("data-theme", isDark ? "dark" : "light")
  }

  function toggleTheme() {
    isDark = !isDark
    applyTheme(isDark)
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light")
    } catch (e) {}
  }

  onMount(() => {
    try {
      const stored = localStorage.getItem("theme")
      if (stored === "dark") {
        isDark = true
      } else if (stored === "light") {
        isDark = false
      } else {
        // respect prefers-color-scheme
        isDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      }
    } catch (e) {
      isDark = false
    }
    applyTheme(isDark)
  })

  onMount(async () => {
    await loadAll(hasQueryParamForLoadingKingdom)
  })

  $effect(() => {
    const sess = page.data.session
    const userId = sess?.user?.id
    loadAll(hasQueryParamForLoadingKingdom)
  })

  function handleResolve() {
    conflictState.showConflict = false
    conflictState.conflictData = null
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  <button class="hamburger" onclick={toggleMenu} aria-label="Toggle menu">
    <span></span>
    <span></span>
    <span></span>
  </button>

  <div class="top-controls">
    {#if !settingsState.hideLoginIcon}
      <div class="auth-indicator">
        {#if loggedIn}
          <a
            href="/stats"
            onclick={() => (isMenuOpen = false)}
            class="auth-link"
          >
            <span class="status-dot online" aria-hidden="true"></span>
            {username || "Profile"}
          </a>
        {:else}
          <a href="/stats" class="auth-link">
            <span class="status-dot offline" aria-hidden="true"></span>
            Sign in
          </a>
        {/if}
      </div>
    {/if}

    {#if !settingsState.hideThemeIcon}
      <button
        class="theme-toggle"
        aria-label="Toggle theme"
        onclick={toggleTheme}
      >
        {#if isDark}
          ☀
        {:else}
          ☾⋆
        {/if}
      </button>
    {/if}
  </div>
</header>

{#if conflictState.showConflict && conflictState.conflictData}
  <ConflictDialog
    conflictData={conflictState.conflictData}
    onResolve={handleResolve}
    hasQueryParamForLoadingKingdom={hasQueryParamForLoadingKingdom}
  />
{/if}

<nav class:open={isMenuOpen}>
  <ul>
    <li class:active={page.url.pathname === "/stats"}>
      <a href="/stats" onclick={() => (isMenuOpen = false)}>Stats</a>
    </li>
    <li class:active={page.url.pathname === "/database"}>
      <a href="/database" onclick={() => (isMenuOpen = false)}>Database</a>
    </li>
    <li class:active={page.url.pathname === "/generator"}>
      <a href="/generator" onclick={() => (isMenuOpen = false)}
        >Kingdom Generator</a
      >
    </li>
    <li class:active={page.url.pathname === "/settings"}>
      <a href="/settings" onclick={() => (isMenuOpen = false)}>Settings</a>
    </li>
    <li class:active={page.url.pathname === "/about"}>
      <a href="/about" onclick={() => (isMenuOpen = false)}>About</a>
    </li>
    <li class:active={page.url.pathname === "/changelog"}>
      <a href="/changelog" onclick={() => (isMenuOpen = false)}>Changelog</a>
    </li>
  </ul>
</nav>

<div class="container">
  {@render children()}
</div>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    padding: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: row;
  }

  @media (max-width: 740px) {
    header {
      position: absolute
    }
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1001;
  }

  .hamburger span {
    width: 2rem;
    height: 0.25rem;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
    background: var(--text);
  }

  nav {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 250px;
    background: var(--bg);
    color: var(--text);
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    z-index: 999;
  }

  nav.open {
    transform: translateX(0);
  }

  nav ul {
    list-style: none;
    padding: 4rem 0 0 0;
    margin: 0;
  }

  li a {
    padding: 1rem 2rem;
    display: block;
  }

  nav li.active {
    background: var(--muted);
  }

  nav a {
    color: var(--text);
    text-decoration: none;
    font-size: 1.1rem;
  }

  header {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    z-index: 1001;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--header-height);
    width: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  .top-controls {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .theme-toggle {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    color: var(--text);
  }

  .theme-toggle:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .auth-indicator {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

  .auth-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text);
    text-decoration: none;
    font-size: 0.95rem;
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.online {
    background: #4caf50;
  }

  .status-dot.offline {
    background: #999;
  }
</style>
