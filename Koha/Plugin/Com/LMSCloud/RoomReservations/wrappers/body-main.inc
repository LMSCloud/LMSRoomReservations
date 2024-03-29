  [% INCLUDE "$PLUGIN_DIR/includes/breadcrumbs.inc" %]

  <div id="lmsr">
    <h3 id="lmsr-heading-main">Koha: LMSRoomReservations: Loading...</h3>
    <div class="lmsr-content-main">
      [% INCLUDE "$PLUGIN_DIR/includes/menu.inc" %]
    
      [% content %]
    </div>

    <script defer>
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (target, name) => target.get(name) || '',
        });
        const lang = document.documentElement.lang.slice(0, 2);
        const translations = {
            tool: {
                en: 'Tool',
                de: 'Werkzeug',
            },
            configure: {
                en: 'Configuration',
                de: 'Konfiguration',
            }
        };
        document.title = document.title.replace('Loading...', translations[params.method][lang]);
        const lastBreadcrumb = document.querySelector('li.breadcrumb-item:last-child');
        lastBreadcrumb.textContent = lastBreadcrumb.textContent.replace('Loading...', translations[params.method][lang]);
        const lmsrHeadingMain = document.getElementById('lmsr-heading-main');
        lmsrHeadingMain.textContent = lmsrHeadingMain.textContent.replace('Loading...', translations[params.method][lang]);
    </script>
[% INCLUDE 'intranet-bottom.inc' %]
