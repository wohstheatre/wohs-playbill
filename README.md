# WOHS Theatre Playbill Sponsorship Portal — Version 2

This version uses separate pages, one shared stylesheet, one settings file, and a mobile-friendly business search page.

## Files you edit most often

### `js/config.js`
Paste all Google links and update season dates here. You should not need to edit every page.

- `trackerUrl`: the normal Google Sheet sharing link. Keep this as a backup.
- `trackerCsvUrl`: the **published CSV URL** used by the search page.
- `claimFormUrl`: Google Form for claiming a business.
- `updateFormUrl`: Google Form for follow-ups, declines, or claim updates.
- `submitSaleFormUrl`: Google Form for completed sales.
- `sponsorshipPacketUrl`: share link for the sponsorship PDF.
- `artworkUploadUrl`: artwork upload form, folder, or instructions.

## Connecting the live Google Sheet search

1. In Google Sheets, keep a public-facing tab with only:
   - Business Name
   - Location
   - Status
   - Claimed Until
   - Last Updated
2. Do not include student names, emails, phone numbers, payments, or private notes.
3. Choose **File → Share → Publish to web**.
4. Select only the public tracker tab.
5. Choose **Comma-separated values (.csv)**.
6. Copy the published URL.
7. Paste it between the quotation marks after `trackerCsvUrl:` in `js/config.js`.

Until a live CSV URL is added, `search.html` uses `data/sample-businesses.csv`, so you can preview the design immediately.

## Uploading Version 2 to GitHub

The safest method is to keep your current site as a backup and upload these files to the repository root.

1. Download and unzip this folder.
2. Open your GitHub repository.
3. Choose **Add file → Upload files**.
4. Drag the contents of the `wohs-playbill-v2` folder into the upload area. Upload the contents, not the outer folder.
5. GitHub should show `index.html`, the other HTML pages, and the `css`, `js`, and `data` folders.
6. Commit with: `Replace site with Version 2`.
7. Wait a minute or two, then refresh the GitHub Pages site.

## Privacy reminder

Anything in a published CSV can be read publicly. Use a separate public tracker tab with no private student or sponsor information.
