<h1>Changelog</h1>

<div class="container">
  <div class="item">
    <h2>11/16/25</h2>
    <p>New Features</p>
    <ul>
      <li>Added a database MongoDB</li>
      <li>Added Google login (for remote storage only)</li>
      <li>Added saving to database as well as localhost</li>
      <li>Added indicator for logged in status</li>
      <li>Added profile page to handle login (and other info in the future)</li>
      <li>Removed card list dropdown (always displays)</li>
      <li>Added Preferences to settings page (non-functional settings)</li>
      <ul>
        <li>Show/Hide sets (remove clutter from unowned sets)</li>
        <li>Show/Hide logged in and theme change indicators</li>
      </ul>
    </ul>

    <p>Fixes</p>
    <ul>
      <li>Various Styling</li>
    </ul>
  </div>

  <div class="item">
    <h2>11/12/25</h2>
    <p>New Features</p>
    <ul>
      <li>Implemented Shelter chance setting</li>
      <li>Implemented attack reaction requirement setting</li>
      <li>Highlight attacks in red in generator</li>
      <li>Added another page link between generation and settings pages</li>
      <li>Show banned card count in settings and link to database</li>
      <li>Improvements to database visuals and filters</li>
    </ul>

    <p>Fixes</p>
    <ul>
      <li>fix: remove reroll icon from extra added cards</li>
      <li>fix: properly exclude more non-kindgom cards (shelters)</li>
    </ul>
  </div>

  <div class="item">
    <h2>11/11/25</h2>
    <p>New Features</p>
    <ul>
      <li>Implemented Require Draw Card setting</li>
      <li>Implemented Require Trashing Card setting</li>
      <li>Implemented Platinum & Colony chance setting</li>
      <li>Sort generated kingdoms alphabetically</li>
    </ul>

    <p>Fixes</p>
    <ul>
      <li>fix: make each new kingdom random (not effected by previous one)</li>
      <li>fix: combine cornucopia & guilds</li>
      <li>fix: prosperity cards not being added to kingdoms</li>
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