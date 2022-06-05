import { envsafe, str, url } from 'envsafe'

export const env = envsafe(
  {
    VITE_MAPBOX_TOKEN: str(),
    VITE_KML_SOURCE: url(),
  },
  { env: import.meta.env },
)
