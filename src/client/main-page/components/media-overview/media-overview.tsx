import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiddenFiles, MediaFile } from '../../../../shared/models/media-models';
import ImageMediaCard from '../image-media-card/image-media-card';
import TextMediaCard from '../text-media-card/text-media-card';
import './media-overview.scss';
import { State } from '../../../../shared/reducers/index-reducer';
import { AppNavigationService } from '../../../../shared/services/app-navigation-service';
import { ReduxMediaService } from '../../../../shared/services/redux-media-service';
import { BrowserService } from '../../../shared/services/browser-service';
import { ReduxSettingsService } from '../../../../shared/services/redux-settings-service';
import { OperationMode } from '../../../../shared/models/settings-models';
import { updateMediaFilesOrder } from '../../../../shared/actions/media-actions';
import { SocketPlayService } from '../../../shared/services/socket-play-service';
import { SocketService } from '../../../shared/services/socket-service';

export function MediaOverview(): JSX.Element {
  const browserService = new BrowserService();
  const appNavigationService = new AppNavigationService();
  const reduxMediaService = new ReduxMediaService();
  const reduxSettingsService = new ReduxSettingsService();

  const dispatch = useDispatch();

  const isTextView = browserService.isTextView();
  const activeTabIndex: number = useSelector((state: State) =>
    appNavigationService.getActiveTabIndex(state.appNavigation)
  );
  const mediaFiles: MediaFile[] = useSelector(
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
  const outputState = useSelector((state: State) =>
    reduxSettingsService.getOutputState(state.settings, activeTabIndex)
  );

  const shownFiles: MediaFile[] = getShownFiles(
    mediaFiles,
    isInEditVisibilityMode,
    hiddenFiles,
    browserService
  );

  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [cuedFileName, setCuedFileName] = useState<string | null>(null);
  const [playingFileName, setPlayingFileName] = useState<string | null>(null);

  const isManualMode = outputState?.manualStartState;

  useEffect(() => {
    if (currentFileIndex >= shownFiles.length) {
      setCurrentFileIndex(0);
    }
  }, [currentFileIndex, shownFiles]);

  // Utiliser useCallback pour mémoriser playFile
  const playFile = useCallback(
    (
      fileName: string,
      activeTabIndex: number,
      cueOnly: boolean = false
    ): void => {
      const fileIndex = shownFiles.findIndex((file) => file.name === fileName);
      if (fileIndex === -1) {
        console.warn(`File ${fileName} not found in shownFiles.`);
        return;
      }

      console.log(`Updating currentFileIndex to: ${fileIndex}`);
      setCurrentFileIndex(fileIndex); // Met à jour l'index

      const socketPlayService = new SocketPlayService(
        SocketService.instance.getSocket()
      );

      if (cueOnly) {
        console.log(`Cueing file: ${fileName}`);
        socketPlayService.loadFile(activeTabIndex, fileName); // Charge le fichier sans le jouer
        setCuedFileName(fileName);
        setPlayingFileName(null); // Assure que playingFileName est null lors du cue
      } else {
        console.log(`Playing file: ${fileName}`);
        socketPlayService.playFile(activeTabIndex, fileName); // Joue le fichier
        setPlayingFileName(fileName);
        setCuedFileName(null); // Efface cuedFileName lors de la lecture
      }
    },
    [shownFiles, activeTabIndex]
  );

  // Utiliser useCallback pour mémoriser cueFile
  const cueFile = useCallback(
    (fileName: string, activeTabIndex: number): void => {
      playFile(fileName, activeTabIndex, true);
    },
    [playFile, activeTabIndex]
  );

  // Utiliser useCallback pour mémoriser playNextFile
  const playNextFile = useCallback(() => {
    const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
    const nextFile = shownFiles[nextFileIndex];

    console.log(`Playing next file: ${nextFile.name}`);
    playFile(nextFile.name, activeTabIndex);
  }, [currentFileIndex, shownFiles, playFile, activeTabIndex]);

  // Fonction pour gérer l'action de démarrage
  const handleStartAction = useCallback(() => {
    if (cuedFileName) {
      // Joue le fichier cued
      playFile(cuedFileName, activeTabIndex);
    } else if (playingFileName) {
      // Joue le fichier suivant
      playNextFile();
    } else {
      // Joue le fichier actuel
      playFile(shownFiles[currentFileIndex].name, activeTabIndex);
    }
  }, [
    cuedFileName,
    playingFileName,
    playFile,
    playNextFile,
    shownFiles,
    currentFileIndex,
    activeTabIndex,
  ]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Numpad0') {
        handleStartAction();
      }

      if (event.code === 'Numpad1') {
        if (playingFileName && !cuedFileName) {
          // Cue le fichier actuellement en lecture
          cueFile(playingFileName, activeTabIndex);
        } else if (cuedFileName) {
          // Cue le fichier suivant
          const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
          cueFile(shownFiles[nextFileIndex].name, activeTabIndex);
        } else {
          // Cue le fichier actuel si rien n'est en lecture
          cueFile(shownFiles[currentFileIndex].name, activeTabIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    currentFileIndex,
    shownFiles,
    cuedFileName,
    playingFileName,
    activeTabIndex,
    handleStartAction,
    cueFile,
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mediaFiles.findIndex((item) => item.name === active.id);
      const newIndex = mediaFiles.findIndex((item) => item.name === over.id);
      const newMediaFiles = arrayMove(mediaFiles, oldIndex, newIndex);

      dispatch(updateMediaFilesOrder(activeTabIndex, newMediaFiles));

      if (currentFileIndex === oldIndex) {
        setCurrentFileIndex(newIndex);
      } else if (oldIndex < currentFileIndex && newIndex >= currentFileIndex) {
        setCurrentFileIndex(currentFileIndex - 1);
      } else if (oldIndex > currentFileIndex && newIndex <= currentFileIndex) {
        setCurrentFileIndex(currentFileIndex + 1);
      }

      console.log(`Updated playing index: ${currentFileIndex}`);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={shownFiles.map((file) => file.name)}
        strategy={verticalListSortingStrategy}
      >
        <div className="c-media-overview">
          {shownFiles.map((file: MediaFile) => (
            <SortableMediaCard
              key={file.name}
              file={file}
              isTextView={isTextView}
              hiddenFiles={hiddenFiles}
              activeTabIndex={activeTabIndex}
              playFile={playFile}
              cueFile={cueFile}
              isManualMode={isManualMode}
              cuedFileName={cuedFileName}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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

function SortableMediaCard({
  file,
  isTextView,
  hiddenFiles,
  activeTabIndex,
  playFile,
  cueFile,
  isManualMode,
  cuedFileName,
}: {
  file: MediaFile;
  isTextView: boolean;
  hiddenFiles: HiddenFiles;
  activeTabIndex: number;
  playFile: (fileName: string, activeTabIndex: number, cueOnly?: boolean) => void;
  cueFile: (fileName: string, activeTabIndex: number) => void;
  isManualMode: boolean;
  cuedFileName: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const handleFileClick = () => {
    if (isDragging) return; // Évite les clics pendant le drag

    if (isManualMode) {
      // Cue le fichier en mode manuel
      cueFile(file.name, activeTabIndex);
    } else {
      // Joue le fichier en mode automatique
      playFile(file.name, activeTabIndex);
    }
  };

  // Modifier handleStartAction pour stopper la propagation
  const handleStartAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    playFile(file.name, activeTabIndex);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`c-media-overview__card ${
        file.name in hiddenFiles ? 'hidden' : ''
      }`}
      {...attributes}
      {...listeners}
      onClick={handleFileClick}
    >
      <div className="c-media-overview__image">
        {isTextView ? (
          <TextMediaCard file={file} activeTabIndex={activeTabIndex} />
        ) : (
          <ImageMediaCard file={file} activeTabIndex={activeTabIndex} />
        )}
      </div>
      {/* Afficher conditionnellement le bouton Start à l'intérieur de la carte */}
      {isManualMode && cuedFileName === file.name && (
        <button
          onClick={handleStartAction}
          className="start-button"
          aria-label="Start playing the cued file"
        >
          Start
        </button>
      )}
    </div>
  );
}

export default MediaOverview;
