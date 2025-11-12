<h1>Changelog</h1>

<div class="container">
  <div class="item">
    <h2>11/11/25</h2>
    <p>New Features</p>
    <ul>
      <li>Implemented Require Draw Card setting</li>
    </ul>

    <p>Fixes</p>
    <ul>
      <li>fix: make each new kingdom random (not effected by previous one)</li>
      <li>fix: combine cornucopia & guilds</li>
      <li>fix: properly exclude more non-kindgom cards (ruins, bat, wish, key)</li>
    </ul>

    <p>Breaking Changes</p>
    <ul>
      <li>Set schema changed, saved settings will be lost and need to be reconfigured</li>
    </ul>
  </div>

  <div class="item">
    <h2>11/10/25</h2>
    <p>New Features</p>
    <ul>
      <li>Added Changelog page</li>
      <li>Added Favicon</li>
    </ul>

    <p>Fixes</p>
    <ul>
      <li>Improved styling</li>
      <li>Improved scaling on mobile</li>
      <li>fix: duplicate cards showing up when rerolling single card</li>
    </ul>
  </div>

  <div class="item">
    <h2>11/5/25</h2>
    <p>Initial Release</p>
  </div>
</div>

<style>
  .container {
    max-width: 80%;
    text-align: left;
  }

  .item {
    border: 1px solid var(--text);
    border-radius: 10px;
    margin: 1rem 0;
    padding: 1rem;
  }

  p {
    font-weight: bold
  }

  @media (max-width: 740px) {
    .container {
      max-width: 100%;
    }
  }
</style>