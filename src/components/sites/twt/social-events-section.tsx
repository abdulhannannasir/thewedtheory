import { sceneFor, VenueScene } from "./venue-scene";

/** Scene B: the daylight social celebration. Its words are `JOURNEY.scenes` ("social") in journey-content.ts. */
export function SocialEventsSection() {
  return <VenueScene {...sceneFor("social")} />;
}
