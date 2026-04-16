<svelte:head>
  <title>Robin Dorré — ADebt Advisory</title>
  <meta name="description" content="Onafhankelijk debt advisory bij vastgoedfinanciering." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap" rel="stylesheet" />
</svelte:head>

<div class="pagina">

  <!-- Bovenste balk: logo -->
  <header class="top">
    <img
      src="https://i.ibb.co/rRYzfPf5/ADebt-logo-woordmerk-Monogram.png"
      alt="ADebt Advisory"
      class="logo"
    />
  </header>

  <div class="lijn-vol"></div>

  <!-- Kerninhoud -->
  <main class="kern">
    <div class="kern-inner">

      <div class="naam-blok">
        <h1 class="naam">Robin<br />Dorré</h1>
        <p class="functie">Debt Advisor &nbsp;·&nbsp; ADebt Advisory</p>
      </div>

      <div class="rechts">
        <p class="omschrijving">
          Onafhankelijk advies bij de structurering
          en financiering van vastgoed —
          van eerste oriëntatie tot closing.
        </p>
        <a href="mailto:robin@adebt.nl" class="contact-knop">
          Neem contact op
        </a>
      </div>

    </div>
  </main>

  <footer class="voet">
    <span>© ADebt Advisory</span>
  </footer>

</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    background: #fff;
  }

  .pagina {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    background: #fff;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }

  /* ---- Header / logo ---- */
  .top {
    padding: 2.5rem 3.5rem;
  }

  .logo {
    width: 200px;
    height: auto;
    display: block;
  }

  /* ---- Volle scheidslijn ---- */
  .lijn-vol {
    width: 100%;
    height: 1px;
    background: #e8e6e0;
  }

  /* ---- Kerninhoud ---- */
  .kern {
    display: flex;
    align-items: center;
    padding: 0 3.5rem;
  }

  .kern-inner {
    width: 100%;
    max-width: 860px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: end;
    padding: 4rem 0;
  }

  /* Naam */
  .naam-blok {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .naam {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3.5rem, 8vw, 5.5rem);
    font-weight: 400;
    line-height: 1.0;
    letter-spacing: -0.01em;
    color: #111;
  }

  .functie {
    margin: 0;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #aaa;
    font-weight: 500;
  }

  /* Rechts: omschrijving + CTA */
  .rechts {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 0.5rem;
  }

  .omschrijving {
    margin: 0;
    font-size: 1rem;
    color: #555;
    line-height: 1.8;
    max-width: 320px;
  }

  /* CTA */
  .contact-knop {
    display: inline-block;
    align-self: flex-start;
    padding: 0.875rem 2rem;
    background: #111;
    color: #fff;
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition: background 0.2s;
  }

  .contact-knop:hover {
    background: #333;
  }

  /* ---- Footer ---- */
  .voet {
    padding: 1.5rem 3.5rem;
    border-top: 1px solid #e8e6e0;
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ccc;
  }

  /* ---- Responsive ---- */
  @media (max-width: 680px) {
    .top {
      padding: 2rem 1.75rem;
    }

    .logo {
      width: 160px;
    }

    .kern {
      padding: 0 1.75rem;
      align-items: flex-start;
    }

    .kern-inner {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      padding: 3rem 0;
    }

    .naam {
      font-size: clamp(3rem, 14vw, 4rem);
    }

    .omschrijving {
      max-width: 100%;
    }

    .contact-knop {
      width: 100%;
      text-align: center;
    }

    .voet {
      padding: 1.5rem 1.75rem;
    }
  }
</style>
