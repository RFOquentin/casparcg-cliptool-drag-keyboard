export const SET_ACTIVE_TAB = 'setActiveTab'
export const SET_CONNECTION_STATUS = 'setConnectionStatus'
export const TOGGLE_SHOW_SETTINGS = 'toggleShowSettings'

export function setActiveTab(tabIndex: number): {
    type: string
    tabIndex: number
} {
    return {
        type: SET_ACTIVE_TAB,
        tabIndex: tabIndex,
    }
}

export function setConnectionStatus(connectionStatus: boolean): {
    type: string
    connectionStatus: boolean
} {
    return {
        type: SET_CONNECTION_STATUS,
        connectionStatus: connectionStatus,
    }
}

export function toggleShowSettings(): { type: string } {
    return {
        type: TOGGLE_SHOW_SETTINGS,
    }
}
