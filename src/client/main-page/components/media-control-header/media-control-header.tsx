import React, { useEffect } from 'react'

import TimerThumbnail from '../timer-thumbnail/timer-thumbnail'
import ControlActions from '../control-actions/control-actions'
import Header from '../../../shared/components/header/header'

export default function MediaControlHeader(): JSX.Element {

    // On ajoute un useEffect pour écouter les touches Enter
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter') {
                console.log("Touche Enter ou NumpadEnter détectée !");
                // Ici, on pourra appeler la fonction qui lit le fichier suivant
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        // Nettoyage de l'event listener quand le composant est démonté
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    return (
        <Header>            
            <TimerThumbnail />
            <ControlActions />
        </Header>
    )
}
