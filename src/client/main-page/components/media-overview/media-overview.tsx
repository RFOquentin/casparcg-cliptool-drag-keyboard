// src/client/main-page/components/media-overview/media-overview.tsx

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ImageMediaCard from '../image-media-card/image-media-card';
import TextMediaCard from '../text-media-card/text-media-card';
import './media-overview.scss';
import { AppNavigationService } from '../../../../shared/services/app-navigation-service';
import { State } from '../../../../shared/reducers/index-reducer';
import { HiddenFiles, MediaFile } from '../../../../shared/models/media-models';
import { ReduxMediaService } from '../../../../shared/services/redux-media-service';
import { ReduxSettingsService } from '../../../../shared/services/redux-settings-service';
import { OperationMode } from '../../../../shared/models/settings-models';
import { BrowserService } from '../../../shared/services/browser-service';

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEnd,
  SortableContainerProps,
  SortableElementProps,
} from 'react-sortable-hoc';

import { arrayMoveImmutable } from 'array-move';

// Importation des actions
import * as IO from '../../../../shared/actions/media-actions';

// Interface pour les props de SortableList
interface SortableListProps extends SortableContainerProps {
  items: MediaFile[];
  activeTabIndex: number;
  isTextView: boolean;
  hiddenFiles: HiddenFiles;
}

// Interface pour les props de SortableItem
interface SortableItemProps extends SortableElementProps {
  file: MediaFile;
  activeTabIndex: number;
  isTextView: boolean;
  hiddenFiles: HiddenFiles;
}

// Création de la poignée de glissement
const DragHandle = SortableHandle(() => (
  <span className="drag-handle">:::</span>
));

export function MediaOverview(): JSX.Element {
  const dispatch = useDispatch();
  const browserService = new BrowserService();
  const appNavigationService = new AppNavigationService();
  const reduxMediaService = new ReduxMediaService();
  const reduxSettingsService = new ReduxSettingsService();

  const isTextView = browserService.isTextView();
  const activeTabIndex: number = useSelector((state: State) =>
    appNavigationService.getActiveTabIndex(state.appNavigation)
  );
  const files: MediaFile[] = useSelector(
    (state: State) =>
      reduxMediaService.getOutput(state.media, activeTabIndex)?.mediaFiles ?? []
  );
  const hiddenFiles: HiddenFiles =
    useSelector((state: State) => state.media.hiddenFiles) ?? {};
  const isInEditVisibilityMode: boolean =
    useSelector(
      (state: State) =>
        reduxSettingsService.getOutputState(state.settings, activeTabIndex)
          .operationMode === OperationMode.EDIT_VISIBILITY
    ) ?? false;
  const shownFiles: MediaFile[] = getShownFiles(
    files,
    isInEditVisibilityMode,
    hiddenFiles,
    browserService
  );

  // Gestion du drag and drop
  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    const reorderedFiles = arrayMoveImmutable(files, oldIndex, newIndex);

    // Mise à jour de l'état Redux avec le nouvel ordre
    dispatch({
      type: IO.UPDATE_MEDIA_FILES,
      channelIndex: activeTabIndex,
      files: reorderedFiles,
    });
  };

  return (
    <SortableList
      items={shownFiles}
      onSortEnd={onSortEnd}
      axis="xy"
      activeTabIndex={activeTabIndex}
      isTextView={isTextView}
      hiddenFiles={hiddenFiles}
      useDragHandle={true} // Activer la poignée de glissement
    />
  );
}

function getShownFiles(
  files: MediaFile[],
  isInEditVisibilityMode: boolean,
  hiddenFiles: HiddenFiles,
  browserService: BrowserService
): MediaFile[] {
  return !isInEditVisibilityMode || browserService.isTextView()
    ? files.filter(({ name }) => !(name in hiddenFiles))
    : files;
}

// Composant pour les éléments triables
const SortableItem = SortableElement(
  (props: SortableItemProps) => {
    const { file, activeTabIndex, isTextView, hiddenFiles } = props;

    // Gérer l'événement de clic
    const handleClick = () => {
      // Votre logique pour jouer le clip ou le sélectionner
      // Par exemple :
      // dispatch({ type: PLAY_CLIP, payload: { file, activeTabIndex } });
    };

    return (
      <div
        className={`c-media-overview__card ${
          file.name in hiddenFiles ? 'hidden' : ''
        }`}
        onClick={handleClick}
      >
        {/* Inclure la poignée de glissement */}
        <DragHandle />
        {/* Votre contenu existant */}
        {isTextView ? (
          <TextMediaCard file={file} activeTabIndex={activeTabIndex} />
        ) : (
          <ImageMediaCard file={file} activeTabIndex={activeTabIndex} />
        )}
      </div>
    );
  }
) as React.ComponentType<SortableItemProps>;

// Composant pour la liste triable
const SortableList = SortableContainer(
  (props: SortableListProps) => {
    const { items, activeTabIndex, isTextView, hiddenFiles } = props;
    return (
      <div className="c-media-overview">
        {items.map((file: MediaFile, index: number) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            file={file}
            activeTabIndex={activeTabIndex}
            isTextView={isTextView}
            hiddenFiles={hiddenFiles}
          />
        ))}
      </div>
    );
  }
) as React.ComponentType<SortableListProps>;
