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
// Import de l'action Redux pour mettre à jour l'ordre des fichiers
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

    // État pour stocker l'index du fichier actuellement sélectionné
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);

    // État pour suivre si le fichier est "cue" ou "play" en mode manuel
    const [isCued, setIsCued] = useState<boolean>(false);

    // Vérification que l'index est dans les limites du tableau
    useEffect(() => {
        if (currentFileIndex >= shownFiles.length) {
            setCurrentFileIndex(0); // Repartir au début si on dépasse la liste
        }
    }, [currentFileIndex, shownFiles]);

    // Fonction pour jouer le fichier suivant
    const playNextFile = () => {
        const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
        const nextFile = shownFiles[nextFileIndex];

        console.log(`Lecture du fichier suivant: ${nextFile.name}`);
        
        // Mettre à jour l'index
        setCurrentFileIndex(nextFileIndex);

        // Appeler la fonction playFile pour jouer la vidéo
        playFile(nextFile.name, activeTabIndex, outputState);
    };

// Gestion des événements clavier, utilisation du "0" et "1" du numpad, sauf en mode manuel
useEffect(() => {
    if (!outputState?.manualStartState) {  // Si on n'est pas en mode manuel
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Numpad0') {  // Utiliser la touche "0" du numpad pour jouer
                if (isCued) {
                    // Si un fichier est cue, le lire en priorité
                    console.log(`Lecture du fichier cue : ${shownFiles[currentFileIndex].name}`);
                    playFile(shownFiles[currentFileIndex].name, activeTabIndex, outputState);
                } else {
                    // Si aucun fichier n'est cue, passer au fichier suivant
                    playNextFile();
                }
            }

            if (event.code === 'Numpad1') {  // Utiliser la touche "1" du numpad pour cue
                // Si un fichier est déjà cue, cue le suivant
                const nextFileIndex = (currentFileIndex + 1) % shownFiles.length;
                const nextFile = shownFiles[nextFileIndex];
                
                if (isCued) {
                    console.log(`Cue du fichier suivant : ${nextFile.name}`);
                    playFile(nextFile.name, activeTabIndex, outputState, true);  // Cue le fichier suivant
                    setCurrentFileIndex(nextFileIndex);  // Mettre à jour l'index pour le suivant
                } else {
                    // Cue le fichier actuel
                    const fileName = shownFiles[currentFileIndex].name;
                    console.log(`Cue du fichier : ${fileName}`);
                    playFile(fileName, activeTabIndex, outputState, true);  // Cue seulement
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }

    // Retourner undefined si en mode manuel pour désactiver les raccourcis
    return undefined;
}, [currentFileIndex, shownFiles, outputState, isCued]);

// Fonction playFile avec option pour cue uniquement
const playFile = (fileName: string, activeTabIndex: number, outputState: any, cueOnly: boolean = false): void => {
    const socketPlayService = new SocketPlayService(SocketService.instance.getSocket());

    if (!outputState?.manualStartState) {
        // Mode automatique : soit on cue, soit on joue en fonction de l'option cueOnly
        if (cueOnly) {
            console.log(`Cue du fichier en mode auto : ${fileName}`);
            socketPlayService.loadFile(activeTabIndex, fileName);  // Juste cue
            setIsCued(true);  // Marquer comme "cued"
        } else if (isCued) {
            console.log(`Lecture du fichier cue : ${fileName}`);
            socketPlayService.playFile(activeTabIndex, fileName);  // Jouer le fichier
            setIsCued(false);  // Réinitialiser l'état de cue
        } else {
            console.log(`Lecture automatique du fichier : ${fileName}`);
            socketPlayService.playFile(activeTabIndex, fileName);  // Jouer le fichier
        }
    } else {
        // Mode manuel : gestion classique cue et play
        if (!isCued) {
            socketPlayService.loadFile(activeTabIndex, fileName);
            setIsCued(true);
            console.log("Fichier cue, prêt à être joué.");
        } else {
            socketPlayService.playFile(activeTabIndex, fileName);
            setIsCued(false);
            console.log("Fichier joué.");
        }
    }
};




    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = mediaFiles.findIndex((item) => item.name === active.id);
            const newIndex = mediaFiles.findIndex((item) => item.name === over.id);
            const newMediaFiles = arrayMove(mediaFiles, oldIndex, newIndex);

            // Mettre à jour l'ordre dans le store Redux
            dispatch(updateMediaFilesOrder(activeTabIndex, newMediaFiles));

            // Vérifier si l'élément déplacé est celui actuellement en lecture
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

    // Utilisation d'un capteur personnalisé pour améliorer l'expérience de drag
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Le drag commence après avoir déplacé la souris de 5 pixels
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
                            setCurrentFileIndex={setCurrentFileIndex}
                            shownFiles={shownFiles}
                            playFile={playFile}
                            outputState={outputState}
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
    setCurrentFileIndex,
    shownFiles,
    playFile,
    outputState,
}: {
    file: MediaFile;
    isTextView: boolean;
    hiddenFiles: HiddenFiles;
    activeTabIndex: number;
    setCurrentFileIndex: (index: number) => void;
    shownFiles: MediaFile[];
    playFile: (fileName: string, activeTabIndex: number, outputState: any) => void;
    outputState: any;
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

    const handleMouseUp = () => {
        if (!isDraggingFlag) { 
            console.log(`Playing video: ${file.name}`);

            const newIndex = shownFiles.findIndex((mediaFile: MediaFile) => mediaFile.name === file.name);
            console.log(`Mise à jour de l'index en cours : ${newIndex}`);
            setCurrentFileIndex(newIndex);

            playFile(file.name, activeTabIndex, outputState);
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
