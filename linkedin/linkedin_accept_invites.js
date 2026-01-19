/**
 * LinkedIn Auto-Accept Invitations Script
 * 
 * This script automatically clicks all "Accept" buttons on the LinkedIn invitations page.
 * It also handles lazy loading by scrolling to the bottom and waiting for new invitations to load.
 * 
 * Usage:
 * 1. Navigate to https://www.linkedin.com/mynetwork/invitation-manager/
 * 2. Open Browser Console (F12 or Right Click -> Inspect -> Console)
 * 3. Paste this script and press Enter.
 */

(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getRandomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    let processedCount = 0;

    async function acceptInvites() {
        // LinkedIn uses varied class names, so we look for buttons containing "Accept" text
        const buttons = Array.from(document.querySelectorAll('button, span'))
            .filter(el => el.textContent.trim() === 'Accept' && el.offsetParent !== null);

        if (buttons.length === 0) {
            console.log("No more visible 'Accept' buttons found. Scrolling...");
            return false;
        }

        console.log(`Found ${buttons.length} invites. Processing...`);

        for (const btn of buttons) {
            // Re-verify the button is still in the DOM and visible (in case it was already clicked or page shifted)
            if (document.contains(btn) && btn.offsetParent !== null) {
                btn.click();
                processedCount++;
                console.log(`Accepted invitation #${processedCount}`);
                
                // Random delay between 800ms and 2000ms to mimic human behavior
                await sleep(getRandomDelay(800, 2000));
            }
        }
        return true;
    }

    async function autoScroll() {
        window.scrollTo(0, document.body.scrollHeight);
        console.log("Scrolling to load more...");
        await sleep(3000); // Wait for potential lazy loading
    }

    console.log("Starting LinkedIn Auto-Accept script...");

    while (true) {
        const found = await acceptInvites();
        
        await autoScroll();

        // Check again after scrolling
        const moreButtons = Array.from(document.querySelectorAll('button, span'))
            .filter(el => el.textContent.trim() === 'Accept' && el.offsetParent !== null);

        if (moreButtons.length === 0) {
            console.log("Finished! No more invitations found.");
            break;
        }
    }

    console.log(`Total invitations accepted: ${processedCount}`);
})();
