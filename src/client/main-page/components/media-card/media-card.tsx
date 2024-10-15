// src/client/main-page/components/media-card/media-card.tsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import './media-card.scss';
import { AppNavigationService } from "../../../../shared/services/app-navigation-service";
import { State } from "../../../../shared/reducers/index-reducer";
import { ReduxSettingsService } from "../../../../shared/services/redux-settings-service";
import { ReduxMediaService } from "../../../../shared/services/redux-media-service";
import { state } from "../../../../shared/store";
import { OperationMode } from "../../../../shared/models/settings-models";
import { FileType, MediaFile } from "../../../../shared/models/media-models";
import { BrowserService } from "../../../shared/services/browser-service";
import { SocketOperationService } from "../../../shared/services/socket-operation-service";
import { SocketService } from "../../../shared/services/socket-service";
import { SocketPlayService } from "../../../shared/services/socket-play-service";

interface MediaCardProps {
  fileName: string;
  fileType: string;
  activeTabIndex: number;
  children?: React.ReactNode;
  buttonClassName?: string;
  wrapperClassName?: string;
}

export default function MediaCard(props: MediaCardProps): JSX.Element {
  const appNavigationService = new AppNavigationService();
  const reduxSettingsService = new ReduxSettingsService();

  const activeTabIndex: number = useSelector(
    (state: State) => appNavigationService.getActiveTabIndex(state.appNavigation)
  );

  // Récupérer cuedFileName et selectedFileName depuis l'état Redux
  const cuedFileName = useSelector(
    (state: State) => reduxSettingsService.getOutputState(state.settings, props.activeTabIndex)?.cuedFileName
  );

  const selectedFileName = useSelector(
    (state: State) => reduxSettingsService.getOutputState(state.settings, props.activeTabIndex)?.selectedFileName
  );

  const manualStartState = useSelector(
    (state: State) => reduxSettingsService.getOutputState(state.settings, props.activeTabIndex)?.manualStartState
  );

  const isSelected: boolean = reduxSettingsService.isThumbnailSelected(props.fileName, state.settings, activeTabIndex);
  const isCued: boolean = reduxSettingsService.isMediaCued(props.fileName, state.settings, activeTabIndex);

  const isSelectedClass = isSelected ? 'selected-thumbnail' : '';
  const chosenClass = isCued ? 'cued-thumbnail' : isSelectedClass;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Numpad0') {
        if (manualStartState) {
          // En mode manuel
          if (cuedFileName) {
            // Un fichier est cued, le jouer
            playFile(cuedFileName, activeTabIndex, props.fileType, true); // forcePlay = true
          }
          // Ne rien faire si aucun fichier n'est cued
        } else {
          // En mode normal
          if (selectedFileName) {
            // Un clip est déjà en lecture, lire le fichier suivant
            playNextFile(activeTabIndex);
          } else if (cuedFileName) {
            // Aucun clip en lecture, lire le fichier cued
            playFile(cuedFileName, activeTabIndex, props.fileType);
          }
          // Ne rien faire si aucun fichier n'est en lecture ou cued
        }
      } else if (event.code === 'Numpad1') {
        if (cuedFileName) {
          // Un fichier est déjà cued, charger le suivant
          loadNextFile(activeTabIndex);
        } else if (selectedFileName) {
          // Un fichier est sélectionné (en lecture), le charger
          loadFile(selectedFileName, activeTabIndex);
        }
        // Ne rien faire si aucun fichier n'est sélectionné ou cued
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFileName, cuedFileName, manualStartState, activeTabIndex, props.fileType]);

  return (
    <div className={`c-media-card ${props.wrapperClassName ?? ''} ${chosenClass}`}>
      <div
        className={`c-media-card__button ${props.buttonClassName ?? ''}`}
        onClick={() => {
          triggerOperationModeAction(props.fileName, props.activeTabIndex, props.fileType);
        }}
      >
        {props.children ?? ''}
      </div>
    </div>
  );
}

function triggerOperationModeAction(fileName: string, activeTabIndex: number, fileType: string): void {
  const browserService = new BrowserService();
  const reduxSettingsService = new ReduxSettingsService();

  if (browserService.isTextView()) {
    return playFile(fileName, activeTabIndex, fileType);
  }
  const operationMode = reduxSettingsService.getOutputState(state.settings, activeTabIndex)?.operationMode;
  switch (operationMode) {
    case OperationMode.EDIT_VISIBILITY:
      toggleVisibility(fileName, activeTabIndex);
      break;
    case OperationMode.CONTROL:
    default:
      playFile(fileName, activeTabIndex, fileType);
      break;
  }
}

function toggleVisibility(fileName: string, activeTabIndex: number): void {
  const reduxSettingsService = new ReduxSettingsService();

  if (
    reduxSettingsService.isCardSelectedOnAnyOutput(fileName, state.settings) ||
    reduxSettingsService.isCardCuedOnAnyOutput(fileName, state.settings)
  ) {
    // Ne rien faire si le fichier est utilisé quelque part
    return;
  }
  new SocketOperationService(SocketService.instance.getSocket()).toggleThumbnailVisibility(activeTabIndex, fileName);
}

function playFile(fileName: string, activeTabIndex: number, fileType: string, forcePlay = false): void {
  const socketPlayService = new SocketPlayService(SocketService.instance.getSocket());
  const reduxSettingsService = new ReduxSettingsService();

  if (fileType === FileType.IMAGE || forcePlay) {
    socketPlayService.playFile(activeTabIndex, fileName);
  } else {
    const manualStartState = reduxSettingsService.getOutputState(state.settings, activeTabIndex)?.manualStartState;
    if (manualStartState && !forcePlay) {
      socketPlayService.loadFile(activeTabIndex, fileName);
    } else {
      socketPlayService.playFile(activeTabIndex, fileName);
    }
  }
}

function loadFile(fileName: string, activeTabIndex: number): void {
  const socketPlayService = new SocketPlayService(SocketService.instance.getSocket());
  socketPlayService.loadFile(activeTabIndex, fileName);
}

function playNextFile(activeTabIndex: number): void {
  const reduxMediaService = new ReduxMediaService();
  const reduxSettingsService = new ReduxSettingsService();

  // Obtenir la liste des fichiers médias mise à jour
  const mediaFiles = reduxMediaService.getOutput(state.media, activeTabIndex)?.mediaFiles ?? [];

  if (mediaFiles.length === 0) {
    // Aucun fichier média disponible, ne rien faire
    return;
  }

  // Récupérer le nom du fichier actuellement en lecture
  const selectedFileName = reduxSettingsService.getOutputState(state.settings, activeTabIndex)?.selectedFileName;

  // Trouver l'index du fichier actuellement en lecture
  const currentIndex = mediaFiles.findIndex((file: MediaFile) => file.name === selectedFileName);

  // Calculer l'index du fichier suivant
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % mediaFiles.length : 0;
  const nextFile = mediaFiles[nextIndex];

  if (nextFile) {
    playFile(nextFile.name, activeTabIndex, nextFile.type);
  }
}

function loadNextFile(activeTabIndex: number): void {
  const reduxMediaService = new ReduxMediaService();
  const reduxSettingsService = new ReduxSettingsService();

  // Obtenir la liste des fichiers médias mise à jour
  const mediaFiles = reduxMediaService.getOutput(state.media, activeTabIndex)?.mediaFiles ?? [];

  if (mediaFiles.length === 0) {
    // Aucun fichier média disponible, ne rien faire
    return;
  }

  // Récupérer le nom du fichier actuellement cued
  const cuedFileName = reduxSettingsService.getOutputState(state.settings, activeTabIndex)?.cuedFileName;

  // Trouver l'index du fichier actuellement cued
  const currentIndex = mediaFiles.findIndex((file: MediaFile) => file.name === cuedFileName);

  // Calculer l'index du fichier suivant
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % mediaFiles.length : 0;
  const nextFile = mediaFiles[nextIndex];

  if (nextFile) {
    loadFile(nextFile.name, activeTabIndex);
  }
}
