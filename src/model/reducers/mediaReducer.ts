import * as IO from './mediaActions'

export interface IMediaFile {
    name: string
    type: string
    size: number
    changed: number
    frames: number
    frameTime: string
    frameRate: number
    duration: number
}

export interface IThumbFile {
    name: string
    type: string
    changed: number
    size: number
    thumbnail?: any
}
export interface IMedia {
    mediaFiles: IMediaFile[]
    thumbnailList: IThumbFile[]
    tallyFile: string[]
    loopState: boolean[]
    mixState: boolean[]
    manualstartState: boolean[]
    time: Array<[number, number]>
}

const defaultMediaState = (): Array<IMedia> => {
    return [
        {
            mediaFiles: [],
            thumbnailList: [],
            tallyFile: [],
            loopState: [],
            mixState: [],
            manualstartState: [],
            time: [],
        },
    ]
}

export const media = (state: Array<IMedia> = defaultMediaState(), action) => {
    let nextState = { ...state }

    switch (action.type) {
        case IO.UPDATE_MEDIA_FILES:
            nextState[0].mediaFiles = action.files
            return nextState
        case IO.UPDATE_THUMB_IST:
            nextState[0].thumbnailList = action.fileList
            return nextState
        case IO.SET_TALLY_FILE_NAME:
            nextState[0].tallyFile[action.channelIndex] = action.filename
            return nextState
        case IO.SET_LOOP:
            nextState[0].loopState[action.channelIndex] = action.loopState
            return nextState
        case IO.SET_MIX:
            nextState[0].mixState[action.channelIndex] = action.mixState
            return nextState
        case IO.SET_MANUAL_START:
            nextState[0].manualstartState[action.channelIndex] =
                action.manualstartState
            return nextState
        case IO.SET_TIME:
            nextState[0].time[action.channelIndex] = action.time
            return nextState
        default:
            return nextState
    }
}
