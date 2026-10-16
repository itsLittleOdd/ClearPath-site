# Request demonstration storyboard

Source: `composition.html` (deterministic, seek-driven). Renderer: `tools/render-video.mjs`. Output (parent-rendered, pending): `assets/media/request-demo.mp4`, `request-demo.webm`, `request-demo-poster.jpg`, `manifest.json`.

Frame 1280 x 720, 24 fps, 20.0 s, silent, fictional data. Persistent top line: "Fictional demonstration. Not connected to a live client system." Persistent bottom-right: approved ClearPath logo. Bottom-left: a one-line status in mono.

| Beat | Time | On screen | Information that changes |
| --- | --- | --- | --- |
| 01 Request arrives | 0.0 to 4.0 | Email card slides in (0.3 s): "Lunch for 30 people?" from morgan@example.com. Desk sheet slides in (0.7 s). Facts appear one at a time at 1.6, 2.2, 2.8, 3.4 s; the matching words are underlined in the email. | Office lunch, Friday the 14th, about 30 people, drop off preferred. |
| 02 Missing detail | 4.0 to 8.0 | Clay flag rises under the facts (4.4 s): "? Delivery address needed". Sheet state: "One detail missing". | The gap is named instead of guessed. |
| 03 Draft reply | 8.0 to 12.0 | Draft card appears (8.3 s); the reply is typed out 8.6 to 11.2 s: "Hi Morgan, thanks for thinking of us. What address should we deliver to? Once I have it, I will check Friday the 14th for 30 people and get right back to you." Chip "Held for owner review" (11.3 s). | A short reply asks for the missing detail and promises a check; nothing is asserted as available. |
| 04 Owner reviews | 12.0 to 16.0 | A separate review card appears under the email in the left column (12.3 s): "Owner reviews the draft", hint "Nothing is sent until the owner decides.", Edit / Approve. Cursor travels to Approve (13.0 to 14.2 s), presses (14.4 s). Stamp "Approved draft" lands on the sheet's draft (14.75 s); the sheet chip becomes "Approved by the owner". The review card and the chip never share a layout area. | The owner's decision is the visible event. |
| 05 Next step | 16.0 to 20.0 | End card fades in (16.2 s): "Approved draft. Ready for the next step." then "Nothing was sent by this demonstration. The owner decided; the desk did the retyping." then the path mark and "A clearer next step. You stay in charge." Hold to 20.0 s. | Final state is an approved draft, not a sent email. |

Poster frame: t = 15.2 s (Edit / Approve row visible, stamp landed, draft readable).

Text equivalent (also exposed as `window.__composition.textEquivalent` and repeated in the page transcript):

1. Request arrives: an email asks for lunch for 30 people on Friday the 14th, drop off preferred.
2. Missing detail: the desk pulls out the facts and flags that a delivery address is needed.
3. Draft: a short reply asks what address to deliver to. It is held for review.
4. Owner reviews: Edit or Approve. The owner presses Approve.
5. End state: approved draft, ready for the next step. Nothing was sent. A clearer next step; you stay in charge.

Determinism notes: no CSS transitions or animations are used on the stage; every style is set from `t`. System fonts render identically run to run on the same machine; a different machine may differ at the pixel level but not in content or timing. The logo is the approved raster, shown through a crop with `mix-blend-mode: darken` so its light margin disappears on paper.
