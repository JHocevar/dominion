<script>
import github from '$lib/assets/github-mark-white.svg'

</script>
<h1>About</h1>

<div class="container">
  <p>
    A simple, but very customizeable companion for the
    <a href="https://www.riograndegames.com/games/dominion/">Dominion</a> card game.
    Designed to be able so customize how cards are added to the kingdom supporting
    all expansions
  </p>

  <div class="github">
    <p>View the code on <a href="https://github.com/JHocevar/dominion">GitHub</a></p><img src={github} alt="github-logo"/>
  </div>


  <h2>Implemented Features</h2>

  <ul>
    <li>Card data source from dominion wiki</li>
    <li>Easily enable or disable sets from the available cards list</li>
    <li>
      Cusotmizeable chances to include certain cards (like platinum/colony)
    </li>
    <li>Individual reroll (reroll any card in generated kingdom)</li>
    <li>Banned card list (never added to kingdoms)</li>
    <li>Save data so it persists on page reload</li>
  </ul>

  <h2>Planned Features</h2>

  <ul>
    <li>Save presets of enabled sets</li>
    <li>Save history of played kingdoms and (optionally) effect weighting</li>
    <li>Choose random events, ways, landmarks, etc...</li>
    <li>Add settings to require traveler, tavern mat, exile, etc...</li>
    <li>Fix +coin on card text and other uses (image on table, fix parsing)</li>
  </ul>
</div>

<style>
  .container {
    max-width: 85%;
  }

  .github {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  img {
    width: 25px;
    height: 25px;
    margin-left: 1rem;
  }
</style>
