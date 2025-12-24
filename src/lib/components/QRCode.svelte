<script lang="ts">
  import { onDestroy } from "svelte"
  import QRCode from "qrcode"

  let {
    address = null,
    colorDark = "#000000",
    colorLight = "#ffffff",
    level = "H",
    onClose,
  } = $props<{
    address: string | null
    size?: number
    colorDark?: string
    colorLight?: string
    level?: "L" | "M" | "Q" | "H"
    onClose?: () => void
  }>()

  let canvas: HTMLCanvasElement | null = null
  let copied = $state(false)

  async function generate() {
    if (!address) {
      clear()
      return
    }

    // determine CSS width (in px) from the rendered canvas; fall back to viewport width
    const targetCssSize = window.innerWidth * 0.85

    const options = {
      width: targetCssSize,
      margin: 1,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: level,
    }

    try {
      if (canvas) {
        // render to the canvas at device-pixel resolution
        QRCode.toCanvas(canvas, address, options as any)
        return
      }
    } catch (err) {
      console.error("Failed to generate QR code", err)
    }
  }

  function clear() {
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  async function copyLink() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      copied = true
    } catch (err) {
      console.error('copy failed', err)
    }
  }

  $effect(() => {
    if (!copied) return
    const t = setTimeout(() => (copied = false), 1500)
    return () => clearTimeout(t)
  })

  // run when `address` (or other props) change; $effect tracks `address`
  $effect(() => {
    if (!address) {
      clear()
      return
    }

    generate()
  })

  onDestroy(() => {
    clear()
  })
</script>

<div class="modal-overlay">
  <div class="modal">
    <h2>Share Link</h2>

    <div class="qr-area">
      <canvas bind:this={canvas} aria-label={address ? `QR code for ${address}` : "QR code"}></canvas>
    </div>

    <p class="link">{#if address}<a href={address} target="_blank" rel="noreferrer">{address}</a>{:else}No link provided{/if}</p>

    <div class="actions">
      <button class="copy" onclick={copyLink}>{copied ? 'Copied' : 'Copy Link'}</button>
      <button class="done" onclick={() => onClose?.()}>Done</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--bg);
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
  }

  h2 {
    margin-top: 0;
    text-align: center;
  }

  .qr-area {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }

  canvas {
    display: block;
    max-width: 500px;
    max-height: 500px;
    height: auto;
  }

  .link {
    text-align: center;
    color: var(--muted, #444);
    word-break: break-all;
    margin: 0.5rem 0 1rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background: #0056b3;
  }

  button.copy {
    background: #6c757d;
  }

  button.copy:hover {
    background: #5a6268;
  }

  a {
    color: lightseagreen;
  }
</style>
