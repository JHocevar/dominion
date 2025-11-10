<script lang="ts">
  import { onMount } from "svelte"
  import "$lib/assets/global.css"
  import favicon from "$lib/assets/favicon.ico"
  import { page } from "$app/state"

  let { children } = $props()
  let isMenuOpen = $state(false)
  let isDark = $state(true)

  function toggleMenu() {
    isMenuOpen = !isMenuOpen
  }

  function applyTheme(isDark: boolean) {
    const x = document.getElementById('html')
    document.getElementById('html')?.setAttribute('data-theme', isDark ? 'dark' : 'light')
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

  <button class="theme-toggle" aria-label="Toggle theme" onclick={toggleTheme}>
    {#if isDark}
      ☀
    {:else}
      ☾⋆
    {/if}
  </button>
</header>

<nav class:open={isMenuOpen}>
  <ul>
    <li class:active={page.url.pathname === "/database"}>
      <a href="/database" onclick={() => (isMenuOpen = false)}>Database</a>
    </li>
    <li class:active={page.url.pathname === "/generator"}>
      <a href="/generator" onclick={() => (isMenuOpen = false)}>Kingdom Generator</a>
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
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--header-height);
    width: 100%;
    box-sizing: border-box;
    padding: 0 var(--spacing-base);
  }

  .theme-toggle {
    position: absolute;
    right: 0;
    top: 0;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 1rem;
    border-radius: 6px;
    color: var(--text);
  }

  .theme-toggle:hover {
    background: rgba(0, 0, 0, 0.03);
  }
</style>
