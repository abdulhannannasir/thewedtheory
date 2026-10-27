import { WhatsAppCTA } from "./whatsapp-cta";
import { sceneFor, VenueScene } from "./venue-scene";

/**
 * Scene D: the grand finale. The main button takes the visitor to the enquiry form just below; a
 * quieter second button opens WhatsApp for anyone who would rather chat. Its words are
 * `JOURNEY.scenes` ("finale") in journey-content.ts.
 */
export function GrandFinale() {
  return (
    <VenueScene {...sceneFor("finale")}>
      <div className="mt-4">
        <WhatsAppCTA
          variant="light"
          label="Or chat on WhatsApp"
          message="Hello The Wed Theory, I’d like to plan an event."
          className="border-transparent px-0 text-[12px] [text-shadow:none] hover:bg-transparent hover:text-white"
        />
      </div>
    </VenueScene>
  );
}
