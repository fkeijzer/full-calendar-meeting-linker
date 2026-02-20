/**
 * @file eventActions.ts
 * @module actions/eventActions
 * @description
 * Provides high-level user action functions for interacting with calendar events,
 * such as opening the note associated with an event in a new pane. These actions
 * coordinate between the EventCache and the Obsidian workspace to perform user-initiated
 * operations from the UI.
 *
 * @remarks
 * Functions in this module are intended to be called from UI components or commands,
 * encapsulating the logic for manipulating event-related files and views.
 *
 * @license See LICENSE.md
 */

import EventCache from '../core/EventCache';
import { MarkdownView, TFile, Vault, Workspace, Notice, MetadataCache } from 'obsidian';
import { t } from '../features/i18n/i18n';

/**
 * Open a file in a NEW PANE (new tab view) to a given event.
 * @param cache
 * @param param1 App
 * @param id event ID
 * @returns
 */
export async function openFileForEvent(
  cache: EventCache,
  {
    workspace,
    vault,
    metadataCache
  }: { workspace: Workspace; vault: Vault; metadataCache: MetadataCache },
  id: string
) {
  const details = cache.store.getEventDetails(id);

  // 1. Haal de stabiele data uit de juiste velden (details.event.xxx)
  const stableId = details?.event?.uid;
  const title = details?.event?.title || 'Untitled Meeting';

  if (!stableId) {
    console.error('Geen stabiele UID gevonden in event details!', details);
    new Notice('Fout: Dit event heeft geen unieke ID.');
    return;
  }

  console.log(`Zoeken naar note voor event: "${title}" met UID: ${stableId}`);

  // 2. Scan de vault op de UID
  const markdownFiles = vault.getMarkdownFiles();
  let targetFile = markdownFiles.find(file => {
    const fileCache = metadataCache.getFileCache(file);
    // Vergelijk de opgeslagen ID met de UID uit de JSON
    return fileCache?.frontmatter?.['outlook-id'] === stableId;
  });

  if (targetFile) {
    console.log('Match gevonden! Bestaande note wordt geopend.');
    const leaf = workspace.getLeaf(true);
    await leaf.openFile(targetFile);
  } else {
    console.log('Geen match. Nieuwe note aanmaken...');
    const folderPath = 'Meetings';

    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }

    // Maak de titel veilig voor bestandsnamen
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '');
    const filePath = `${folderPath}/${safeTitle}.md`;

    const fileContent = `---
outlook-id: ${stableId}
type: meeting
date: ${(details.event as any).date || new Date().toISOString()}
---
# ${title}

## Notes
- `;

    try {
      const newFile = await vault.create(filePath, fileContent);
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(newFile);
    } catch (error) {
      console.error('Fout bij aanmaken:', error);
      // Als de file al bestaat op naam, maar de ID klopte niet, open hem dan alsnog
      const existingFile = vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        await workspace.getLeaf(true).openFile(existingFile);
      }
    }
  }
}
