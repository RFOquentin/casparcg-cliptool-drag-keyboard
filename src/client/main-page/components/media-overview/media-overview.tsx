import React, { useState, useEffect } from 'react';
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
    const outputState = useSelector((state: State) => reduxSettingsService.getOutputState(state.settings, activeTabIndex));

    const shownFiles: MediaFile[] = getShownFiles(
        mediaFiles,
        isInEditVisibilityMode,
        hiddenFiles,
        browserService
    );

    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [cuedFileName, setCuedFileName] = useState<string | null>(null);
    const [playingFileName, setPlayingFileName] = useState<string | null>(null);

    useEffect(() => {
        if (currentFileIndex >= shownFiles.length) {
            setCurrentFileIndex(0);
        }
    }, [currentFileIndex, shownFiles]);

    const playNextFile = () => {
        const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
        const nextFile = shownFiles[nextFileIndex];

        console.log(`Lecture du fichier suivant: ${nextFile.name}`);
        playFile(nextFile.name, activeTabIndex);
    };

    const playFile = (fileName: string, activeTabIndex: number, cueOnly: boolean = false): void => {
        const socketPlayService = new SocketPlayService(SocketService.instance.getSocket());

        if (cueOnly) {
            console.log(`Cue du fichier : ${fileName}`);
            socketPlayService.loadFile(activeTabIndex, fileName); // On charge le fichier sans le lire
            setCuedFileName(fileName);
        } else {
            console.log(`Lecture du fichier : ${fileName}`);
            socketPlayService.playFile(activeTabIndex, fileName); // On passe en lecture ici
            setPlayingFileName(fileName);
            setCuedFileName(null);
        }

        const newIndex = shownFiles.findIndex((file) => file.name === fileName);
        setCurrentFileIndex(newIndex);
        console.log(`Mise à jour de l'index : ${newIndex}`);
    };

    const cueFile = (fileName: string, activeTabIndex: number): void => {
        playFile(fileName, activeTabIndex, true);
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
    
            if (event.code === 'Numpad0') {
                if (cuedFileName) {
                    // On lit toujours le fichier cue, même si on le cue plusieurs fois
                    playFile(cuedFileName, activeTabIndex);
                } else if (playingFileName) {
                    playNextFile(); // Si aucun fichier n'est cue, on passe au suivant
                } else {
                    playFile(shownFiles[currentFileIndex].name, activeTabIndex); // On lit l'élément courant
                }
            }
    
            if (event.code === 'Numpad1') {
                if (playingFileName && !cuedFileName) {
                    // Si un fichier est en lecture mais non cue, on cue le fichier en cours de lecture
                    cueFile(playingFileName || shownFiles[currentFileIndex].name, activeTabIndex);
                } else {
                    // On cue l'élément suivant
                    const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
                    cueFile(shownFiles[nextFileIndex].name, activeTabIndex);
                }
            }
        };
    
        window.addEventListener('keydown', handleKeyPress);
    
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [currentFileIndex, shownFiles, outputState, cuedFileName, playingFileName]);

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

            console.log(`Nouvel index en lecture : ${currentFileIndex}`);
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
                            isManualMode={outputState?.manualStartState}
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
    isManualMode,
}: {
    file: MediaFile;
    isTextView: boolean;
    hiddenFiles: HiddenFiles;
    activeTabIndex: number;
    playFile: (fileName: string, activeTabIndex: number, cueOnly?: boolean) => void;
    isManualMode: boolean;
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

    const [isDraggingFlag, setIsDraggingFlag] = useState(false);

    const handleMouseDown = () => {
        setIsDraggingFlag(false);
    };

    const handleMouseMove = () => {
        setIsDraggingFlag(true);
    };

    const handleFileClick = () => {
        if (isManualMode) {
            // Toujours faire un cue en mode manuel
            playFile(file.name, activeTabIndex, true); // Forcer le cue uniquement
        } else {
            playFile(file.name, activeTabIndex); // Sinon on lit le fichier
        }
    };

    const handleMouseUp = () => {
        if (!isDraggingFlag) {
            handleFileClick();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`c-media-overview__card ${file.name in hiddenFiles ? 'hidden' : ''}`}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div className="c-media-overview__image">
                {isTextView ? (
                    <TextMediaCard file={file} activeTabIndex={activeTabIndex} />
                ) : (
                    <ImageMediaCard file={file} activeTabIndex={activeTabIndex} />
                )}
            </div>
        </div>
    );
}

export default MediaOverview;
