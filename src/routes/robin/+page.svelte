<svelte:head>
  <title>ADebt Advisory</title>
  <meta name="description" content="Onafhankelijk debt advisory bij vastgoedfinanciering." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="pagina">
  <div class="kader">

    <!-- Header -->
    <header class="top">
      <img
        src="https://i.ibb.co/tVHPZy8/adebt.png"
        alt="ADebt Advisory"
        class="logo"
      />
      <a href="mailto:aanvraag@adebt.nl" class="top-link">aanvraag@adebt.nl</a>
    </header>

    <div class="lijn"></div>

    <!-- Hero -->
    <section class="sectie">
      <span class="label">01 — intro</span>
      <div class="content">
        <h1 class="headline">
          Optimale vastgoedfinanciering.<br />
          <em>Gebouwd op ervaring.</em>
        </h1>
        <p class="subline">
          Van ontwikkeling tot belegging: wij begrijpen uw project vanuit onze
          eigen ervaring als vastgoedontwikkelaar en -belegger.
        </p>
      </div>
    </section>

    <div class="lijn"></div>

    <!-- Proces -->
    <section class="sectie">
      <span class="label">02 — proces</span>
      <div class="content">
        <div class="fases-grid">
          <div class="fase">
            <span class="fase-nr">01</span>
            <h2 class="fase-titel">Oriëntatie</h2>
            <p class="fase-tekst">
              Bespreking van het project, de ambities en de financieringsbehoefte.
            </p>
          </div>

          <div class="fase">
            <span class="fase-nr">02</span>
            <h2 class="fase-titel">Indicatie</h2>
            <p class="fase-tekst">
              Eerste beeld van de markt en realistische financieringsstructuren.
            </p>
          </div>

          <div class="fase">
            <span class="fase-nr">03</span>
            <h2 class="fase-titel">Dossiervorming</h2>
            <p class="fase-tekst">
              Samenstelling van een professioneel en compleet financieringsdossier.
            </p>
          </div>

          <div class="fase">
            <span class="fase-nr">04</span>
            <h2 class="fase-titel">Aanbod</h2>
            <p class="fase-tekst">
              Vergelijking van offertes en begeleiding tot aan de closing.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="lijn"></div>

    <!-- Contact -->
    <section class="sectie">
      <span class="label">03 — contact</span>
      <div class="content">
        <p class="contact-tekst">
          Beschrijf kort uw casus en krijg binnen 24 uur — op werkdagen — een
          indicatie van de mogelijkheden.
        </p>
        <a href="mailto:aanvraag@adebt.nl" class="contact-link">
          <span>aanvraag@adebt.nl</span>
          <span class="pijl">→</span>
        </a>
      </div>
    </section>

    <div class="lijn"></div>

    <footer class="voet">
      <span>© ADebt Advisory 2026</span>
      <span>Amsterdam</span>
    </footer>

  </div>
</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    background: #fff;
  }

  .pagina {
    min-height: 100dvh;
    background: #fff;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: #111;
    display: flex;
    justify-content: center;
  }

  .kader {
    width: 100%;
    max-width: 1280px;
    padding: 0 3rem;
    display: flex;
    flex-direction: column;
  }

  /* ---- Header ---- */
  .top {
    padding: 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    width: 140px;
    height: auto;
    display: block;
  }

  .top-link {
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #111;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .top-link:hover {
    color: #666;
  }

  /* ---- Lijnen ---- */
  .lijn {
    width: 100%;
    height: 1px;
    background: #e8e6e0;
  }

  /* ---- Secties ---- */
  .sectie {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 48px;
    padding: 5rem 0;
  }

  .label {
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    color: #888;
    padding-top: 0.5rem;
  }

  /* ---- Hero ---- */
  .headline {
    margin: 0 0 1.75rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: #111;
    max-width: 22ch;
  }

  .headline em {
    font-style: italic;
    font-weight: 300;
  }

  .subline {
    margin: 0;
    font-size: 0.9375rem;
    color: #555;
    line-height: 1.85;
    max-width: 52ch;
  }

  /* ---- Fases ---- */
  .fases-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }

  .fase {
    display: flex;
    flex-direction: column;
  }

  .fase-nr {
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    color: #888;
    margin-bottom: 1.25rem;
  }

  .fase-titel {
    margin: 0 0 0.75rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.375rem;
    font-weight: 400;
    color: #111;
  }

  .fase-tekst {
    margin: 0;
    font-size: 0.8125rem;
    color: #777;
    line-height: 1.75;
  }

  /* ---- Contact ---- */
  .contact-tekst {
    margin: 0 0 2rem;
    font-size: 0.9375rem;
    color: #555;
    line-height: 1.85;
    max-width: 52ch;
  }

  .contact-link {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: #111;
    text-decoration: underline;
    text-underline-offset: 6px;
    text-decoration-thickness: 1px;
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    transition: color 0.2s;
  }

  .contact-link:hover {
    color: #555;
  }

  .pijl {
    text-decoration: none;
    display: inline-block;
    transition: transform 0.2s ease;
  }

  .contact-link:hover .pijl {
    transform: translateX(4px);
  }

  /* ---- Footer ---- */
  .voet {
    padding: 1.5rem 0;
    display: flex;
    justify-content: space-between;
    font-size: 0.625rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #aaa;
  }

  /* ---- Responsive ---- */
  @media (max-width: 900px) {
    .kader {
      padding: 0 2rem;
    }

    .sectie {
      grid-template-columns: 100px 1fr;
      gap: 32px;
      padding: 4rem 0;
    }

    .fases-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px 24px;
    }
  }

  @media (max-width: 600px) {
    .kader {
      padding: 0 1.5rem;
    }

    .top {
      padding: 1.5rem 0;
    }

    .logo {
      width: 110px;
    }

    .top-link {
      font-size: 0.625rem;
    }

    .sectie {
      grid-template-columns: 1fr;
      gap: 1.25rem;
      padding: 3rem 0;
    }

    .label {
      padding-top: 0;
    }

    .fases-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .contact-link {
      font-size: 1.375rem;
    }

    .voet {
      padding: 1.25rem 0;
      font-size: 0.5625rem;
    }
  }
</style>
