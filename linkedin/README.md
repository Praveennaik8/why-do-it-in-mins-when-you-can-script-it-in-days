# 🔗 LinkedIn Scripts

Scripts for automating LinkedIn interactions.

---

## Auto-Accept Invitations

**File:** [`linkedin_accept_invites.js`](./linkedin_accept_invites.js)

Automatically accepts all pending connection invitations on LinkedIn. Handles lazy-loaded content by auto-scrolling to the bottom and waiting for new invitations to appear.

### Features

- Finds and clicks all visible "Accept" buttons.
- Random delays (800ms–2s) between clicks to mimic human behavior.
- Auto-scrolls to load more invitations.
- Logs progress and total count to the console.

### Usage

1. Go to the [LinkedIn Invitation Manager](https://www.linkedin.com/mynetwork/invitation-manager/).
2. Open **DevTools → Console** (`F12`).
3. Paste the contents of `linkedin_accept_invites.js` and press **Enter**.
4. Let it run — it will stop automatically when no more invitations are found.
