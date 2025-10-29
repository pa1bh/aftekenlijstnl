# AI Agent Basisrichtlijnen

Deze handleiding definieert de standaardverwachtingen voor AI-agents (zoals Codex) binnen dit project. Richt je op voorspelbare, veilige workflows en licht de gebruiker in wanneer er keuzes gemaakt moeten worden.

## Doel & Scope
- Bied ondersteuning bij ontwikkeling, documentatie en analyse voor dit project.
- Lever oplossingen die lokaal uitvoerbaar zijn zonder extra afhankelijkheden.
- Communiceer helder in het Nederlands, tenzij de gebruiker anders aangeeft.
- Deze app is specifiek ontwikkeld voor de site aftekenlijst.nl. Dit is een gratis site zonder reclame of tracking om ouders te helpen structuur te geven aan hun kinderen.
- De doelgroep voor de interface zijn de ouders van kinderen ongeveer tussen de 3 en 8 jaar. De aftekenlijsten zelf zijn voor de kinderen.

## Standaardinstellingen
- **Runtime:** lokale browser of eenvoudige statische hosting; geen server-side componenten toevoegen zonder expliciete aanvraag.
- **Taal:** Nederlands voor uitleg en documentatie; code mag Engelse conventies volgen.
- **Opslag:** gebruik bestaande projectstructuur; voorkom verspreid aanmaken van nieuwe mappen zonder overleg.
- **Public map:** alle bestanden die geserveerd worden staan in `public/`. Houd die map de enige docroot voor hosting.
- **Bestandsbeheer:** werk binnen de repository. Verander bestanden buiten de werkdirectory niet.
- **Consistentie**: hou de interface zo concistend mogelijk qua design en UX.
- **App**: geef de interface zoveel mogelijk een app gevoel. Gebruik de ruikmte effectief en waar mogelijk hele hoogte geruiken van het scherm zonder te scrollen.
## Technische Richtlijnen
- **Geen externe libraries:** beperk je tot native web-API's en bestaande projectcode. Introduceer alleen nieuwe packages na akkoord van de gebruiker.
- **Geen externe bronnen laden:** laad geen assets via CDN's of andere externe URL's. Bundel benodigde assets lokaal in `public/assets/`.
- **Performance:** houd assets licht en zorg dat animaties en scripts soepel draaien op middenklasse hardware.
- **Compatibiliteit:** mik op moderne evergreen browsers. Benoem het als er features zijn die oudere browsers niet ondersteunen.
- **platform**: Het target platform is in eerste instantie Smartphone en Tablet. Voorkeur voor Iphone en Ipad.

## Werkwijze
- **Analyse:** inspecteer eerst de huidige code voordat je wijzigingen voorstelt.
- **Planning:** licht de gebruiker je voorgenomen stappen toe bij complexe taken.
- **Communicatie:** geef context bij wijzigingen en verwijs naar bestanden met bestands- en regelvermelding.

## Keuzes & Alternatieven
- Noteer relevante overwegingen (prestatie, onderhoud, UX, toegankelijkheid).
- Wanneer er meerdere routes zijn, beschrijf de opties, benoem de trade-offs en vraag de gebruiker om te kiezen.
- Documenteer eventuele aannames en vraag om bevestiging als informatie ontbreekt.

## Beveiliging & Privacy
- Gebruik geen onnodige logging van persoonlijke gegevens (zoals voortgangsdata van gebruikers).
- Houd lokale opslag minimaal en transparant; informeer de gebruiker wat er wordt opgeslagen.

## Na Afloop
- Stel logische vervolgstappen voor, zoals testen, deployment of review.
- Bewaar wijzigingen in ASCII tenzij er een duidelijke reden is om UTF-8-emoji of speciale tekens te gebruiken.

Volg deze richtlijnen om consistent, transparant en veilig samen te werken met menselijke ontwikkelaars binnen dit project.
