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
    metadataCache,
    settings
  }: {
    workspace: Workspace;
    vault: Vault;
    metadataCache: MetadataCache;
    settings: any;
  },
  id: string
) {
  const details = cache.store.getEventDetails(id);

  const stableId = details?.event?.uid;
  const title = details?.event?.title || 'Untitled Meeting';

  if (!stableId) {
    console.error('Geen stabiele UID gevonden in event details!', details);
    new Notice('Fout: Dit event heeft geen unieke ID.');
    return;
  }

  const markdownFiles = vault.getMarkdownFiles();
  let targetFile = markdownFiles.find(file => {
    const fileCache = metadataCache.getFileCache(file);
    return fileCache?.frontmatter?.['outlook-id'] === stableId;
  });

  if (targetFile) {
    const leaf = workspace.getLeaf(true);
    await leaf.openFile(targetFile);
  } else {
    // CHANGED: Get folder from Settings, with backup use of '00_Meetings'
    const folderPath = settings.meetingNoteFolder || '00_Meetings';

    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }

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
      const existingFile = vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        await workspace.getLeaf(true).openFile(existingFile);
      }
    }
  }
}
