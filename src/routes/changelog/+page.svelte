<h1>Changelog</h1>

<div class="container">
  <div class="item">
    <h2>1.1</h2>
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
    <h2>1.0</h2>
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