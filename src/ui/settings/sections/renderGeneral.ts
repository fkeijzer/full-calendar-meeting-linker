/**
 * @file renderGeneral.ts
 * @brief Renders the general settings section of the plugin settings tab.
 * @license See LICENSE.md
 */

import { Setting, TFolder } from 'obsidian'; // Samengevoegde import
import FullCalendarPlugin from '../../../main';
import { t } from '../../../features/i18n/i18n';

const INITIAL_VIEW_OPTIONS = {
  DESKTOP: {
    timeGridDay: 'settings.viewOptions.day',
    timeGridWeek: 'settings.viewOptions.week',
    dayGridMonth: 'settings.viewOptions.month',
    listWeek: 'settings.viewOptions.list'
  },
  MOBILE: {
    dayGridMonth: 'settings.viewOptions.month',
    timeGrid3Days: 'settings.viewOptions.threeDays',
    timeGridDay: 'settings.viewOptions.day',
    listWeek: 'settings.viewOptions.list'
  }
};

export function renderGeneralSettings(
  containerEl: HTMLElement,
  plugin: FullCalendarPlugin,
  rerender: () => void
): void {
  const desktopViewOptions: { [key: string]: string } = { ...INITIAL_VIEW_OPTIONS.DESKTOP };
  if (plugin.settings.enableAdvancedCategorization) {
    desktopViewOptions['resourceTimelineWeek'] = 'settings.viewOptions.timelineWeek';
    desktopViewOptions['resourceTimelineDay'] = 'settings.viewOptions.timelineDay';
  }

  // --- NIEUW: MAPPENLIJST LOGICA ---
  const directories = plugin.app.vault
    .getAllLoadedFiles()
    .filter((f): f is TFolder => f instanceof TFolder)
    .map(f => f.path)
    .sort();

  const folderOptions: Record<string, string> = {};
  directories.forEach(path => {
    folderOptions[path] = path;
  });

  new Setting(containerEl)
    .setName('Meeting notes folder')
    .setDesc('Kies de map waar nieuwe meeting notes worden opgeslagen.')
    .addDropdown(dropdown => {
      dropdown
        .addOptions(folderOptions)
        .setValue(plugin.settings.meetingNoteFolder || 'Meetings')
        .onChange(async value => {
          plugin.settings.meetingNoteFolder = value;
          await plugin.saveSettings();
        });
    });
  // --- EINDE MAPPENLIJST ---

  // --- NIEUW: TEMPLATE LOGICA ---
  // Collect all Markdown files in the vault (for templates)
  const allFiles = plugin.app.vault.getMarkdownFiles();
  const templateOptions: Record<string, string> = { '': 'Geen template' };
  allFiles.forEach(file => {
    templateOptions[file.path] = file.path;
  });

  // Add template-selector
  new Setting(containerEl)
    .setName('Meeting note template')
    .setDesc('Kies een template die onder de Outlook-data geplakt moet worden.')
    .addDropdown(dropdown => {
      dropdown
        .addOptions(templateOptions)
        .setValue(plugin.settings.meetingNoteTemplate || '')
        .onChange(async value => {
          plugin.settings.meetingNoteTemplate = value;
          await plugin.saveSettings();
        });
    });
  // --- EINDE TEMPLATE LOGICA ---

  // --- NIEUW: DESKTOP WEERGAVE LOGICA ---
  new Setting(containerEl)
    .setName('Standaard weergave (Desktop)')
    .setDesc('Kies met welke weergave de kalender standaard opent in het hoofdvenster.')
    .addDropdown(dropdown => {
      Object.entries(desktopViewOptions).forEach(([value, labelKey]) => {
        dropdown.addOption(value, t(labelKey));
      });
      dropdown.setValue(plugin.settings.initialView?.desktop || 'timeGridWeek');
      dropdown.onChange(async view => {
        if (!plugin.settings.initialView) {
          plugin.settings.initialView = { desktop: 'timeGridWeek', mobile: 'listWeek' };
        }
        plugin.settings.initialView.desktop = view;
        await plugin.saveSettings();
      });
    });
  // --- EINDE DESKTOP WEERGAVE ---

  new Setting(containerEl)
    .setName(t('settings.general.mobileInitialView.label'))
    .setDesc(t('settings.general.mobileInitialView.description'))
    .addDropdown(dropdown => {
      Object.entries(INITIAL_VIEW_OPTIONS.MOBILE).forEach(([value, labelKey]) => {
        dropdown.addOption(value, t(labelKey));
      });
      dropdown.setValue(plugin.settings.initialView.mobile);
      dropdown.onChange(async initialView => {
        plugin.settings.initialView.mobile = initialView;
        await plugin.saveSettings();
      });
    });

  new Setting(containerEl)
    .setName(t('settings.general.displayTimezone.label'))
    .setDesc(t('settings.general.displayTimezone.description'))
    .addDropdown(dropdown => {
      const timezones = Intl.supportedValuesOf('timeZone');
      timezones.forEach(tz => {
        dropdown.addOption(tz, tz);
      });
      dropdown.setValue(
        plugin.settings.displayTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      dropdown.onChange(async newTimezone => {
        plugin.settings.displayTimezone = newTimezone;
        await plugin.saveSettings();
      });
    });

  new Setting(containerEl)
    .setName(t('settings.general.clickToCreateEvent.label'))
    .setDesc(t('settings.general.clickToCreateEvent.description'))
    .addToggle(toggle => {
      toggle.setValue(plugin.settings.clickToCreateEventFromMonthView);
      toggle.onChange(async val => {
        plugin.settings.clickToCreateEventFromMonthView = val;
        await plugin.saveSettings();
      });
    });
}
