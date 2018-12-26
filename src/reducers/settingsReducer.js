const defaultSettingsReducerState = [{
    settings: {
        ipAddress: 'localhost',
        port: '5250',
        mainFolder: '',
        tabData: [
            { key: 1, title: 'SCREEN 1', subFolder: '', loop: false, autoPlay: false},
            { key: 2, title: 'SCREEN 2', subFolder: '', loop: false, autoPlay: false},
            { key: 3, title: 'SCREEN 3', subFolder: '', loop: false, autoPlay: false},
            { key: 4, title: '', subFolder: '', loop: false, autoPlay: false},
            { key: 5, title: '', subFolder: '', loop: false, autoPlay: false},
            { key: 6, title: '', subFolder: '', loop: false, autoPlay: false},
        ]
    }
}];

export const settingsReducer = ((state = defaultSettingsReducerState, action) => {
    let { ...nextState } = state;

    switch(action.type) {
        case 'SET_SETTINGS':
            nextState[0].settings = action.data;
            return nextState;
        default:
            return nextState;
    }
});
