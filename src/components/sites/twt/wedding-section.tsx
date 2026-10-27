import { sceneFor, VenueScene } from "./venue-scene";

/** Scene A: the wedding venue. Its words are `JOURNEY.scenes` ("weddings") in journey-content.ts. */
export function WeddingSection() {
  return <VenueScene {...sceneFor("weddings")} />;
}
