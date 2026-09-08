# UX Review: Desktop vs. Mobile (Pre-Login & Post-Signup)

Evaluated across Chrome Desktop (macOS) and Mobile Viewport (iPhone 14 emulation).

### Key Observations
* **Pre-login Experience:** The clean hero section and suggested prompt pills guide initial engagement smoothly. However, the OneTrust consent overlay aggressively blocks pointer interactions before manual dismissal.
* **Mobile Viewport Friction:** On narrow viewports, long welcome texts push the primary chat input downward, and soft-keyboard triggering causes sudden viewport jumps.
* **Post-Signup Continuity:** Upon completing signup, guest conversation history does not persist into the authenticated session. Users are greeted with an empty dashboard, losing the context that triggered their conversion.

### Prioritized Proposed Improvements

1. **Guest-to-Authenticated Session Migration (High Priority)**
   * *Observation:* Signing up discards previous pre-login agent conversations.
   * *Impact:* User churn. High-intent users exploring the product lose context right after conversion.
   * *Proposed Change:* Cache guest conversation UUID in `localStorage` and link it to the newly created `user_id` during the post-registration callback.

2. **OneTrust Consent Non-Blocking Lazy Load (High Priority)**
   * *Observation:* Cookie modal renders synchronously over the input field, hijacking keyboard input.
   * *Impact:* Degrades Time-to-Interactive (TTI) and disrupts early onboarding.
   * *Proposed Change:* Relocate the consent banner to a non-modal bottom sheet that permits typing while pending consent.

3. **Mobile Virtual Keyboard Viewport Anchoring (Medium Priority)**
   * *Observation:* Virtual keyboard appearance obscures the active chat input container on mobile screens.
   * *Impact:* Distorts user interaction for over 50% of mobile users.
   * *Proposed Change:* Adopt `interactive-widget=resizes-content` in the viewport meta tag and anchor the input dock securely with CSS dynamic viewport units (`dvh`).

4. **Empty State Prompt Suggestion Carousel (Medium Priority)**
   * *Observation:* Suggested guidance pills disappear permanently once the initial query executes.
   * *Impact:* Users run out of query ideas after the first response.
   * *Proposed Change:* Display contextual "Follow-up Questions" horizontally above the chat dock after each completed agent answer.