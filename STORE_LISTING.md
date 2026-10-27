# Chrome Web Store listing

## Name

AO3 Exact Title Search

## Summary

Use AO3's native search box for contiguous exact-title searches.

## Description

AO3 Exact Title Search keeps the AO3 interface unchanged while adjusting searches submitted through the native header search box.

The complete search input is sent to AO3 as a title phrase. On the resulting page, the extension checks the rendered work titles and hides results that do not contain the same contiguous text in the same order.

The extension runs only on `archiveofourown.org` and does not add a toolbar popup or modify the visible search interface.

This is an independent tool and is not affiliated with or endorsed by the Organization for Transformative Works or Archive of Our Own.

## Single purpose

Make searches submitted through AO3's native header search box use contiguous exact-title matching.

## Permission justification

The content script is limited to `https://archiveofourown.org/*` because it must observe the native AO3 search form and verify titles rendered on AO3 search-result pages. The manifest declares no optional permissions, storage permission, history permission, account permission, or cross-site host permission.

## Data disclosure

The extension does not collect or transmit user data. Search text is processed in the browser to construct an AO3 search URL. No extension storage is used.

## Category

Productivity

## Language

English
