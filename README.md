# Bike Map

A map that shows bike routes and bike related things in the Tel Aviv area. It uses data from OSM and from a community backed Google MyMaps map that includes notes about dangerous/recommended roads, etc.

## How it works

The data from the MyMaps map is fetched by the website (there's an env var for the url of the kml file for the map) and then parsed on the fly, mainly based on the colors used for each element on the map.

The OSM data is fetched using a prebuild script (`src/buildOsm.ts`) which you run using `npm run prebuild`, which is automatically ran when you `npn run build`. It generates a `src/osmData.json` file, which is then bundled with the app.

The map is displayed using Mapbox (and there's an env var for the token).

The app is bundled/built/whatever using Vite. You can run a local server using `npm run dev` and build a production build using `npm run build`. There's also `npm run preview` but I have no idea what that does.
