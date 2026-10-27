import { sceneFor, VenueScene } from "./venue-scene";

/** Scene C: the corporate environment. Its words are `JOURNEY.scenes` ("corporate") in journey-content.ts. */
export function CorporateEventsSection() {
  return <VenueScene {...sceneFor("corporate")} />;
}
