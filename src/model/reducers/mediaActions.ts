import { HiddenFileInfo, IMediaFile, IThumbnailFile } from './mediaReducer'

export const UPDATE_MEDIA_FILES = 'updateMediaFiles'
export const UPDATE_THUMB_LIST = 'updateThumbList'
export const UPDATE_FOLDER_LIST = 'updateFolderList'
export const UPDATE_HIDDEN_FILES = 'updateHiddenFiles'
export const SET_TALLY_FILE_NAME = 'setTallyFileName'
export const SET_NUMBER_OF_OUTPUTS = 'setNumberOfOutputs'

export const SET_TIME = 'setTime'

export const updateMediaFiles = (
    channelIndex: number,
    fileList: IMediaFile[]
) => {
    return {
        type: UPDATE_MEDIA_FILES,
        channelIndex: channelIndex,
        files: fileList,
    }
}

export const updateFolderList = (folderList: string[]) => {
    return {
        type: UPDATE_FOLDER_LIST,
        folderList: folderList,
    }
}

export const updateThumbFileList = (
    channelIndex: number,
    fileList: IThumbnailFile[]
) => {
    return {
        type: UPDATE_THUMB_LIST,
        channelIndex: channelIndex,
        fileList: fileList,
    }
}

export function updateHiddenFiles(hiddenFiles: Record<string, HiddenFileInfo>) {
    return {
        type: UPDATE_HIDDEN_FILES,
        hiddenFiles: hiddenFiles,
    }
}

export const setNumberOfOutputs = (amount: number) => {
    return {
        type: SET_NUMBER_OF_OUTPUTS,
        amount: amount,
    }
}

export const setTallyFileName = (channelIndex: number, filename: string) => {
    return {
        type: SET_TALLY_FILE_NAME,
        channelIndex: channelIndex,
        filename: filename,
    }
}

export const setTime = (channelIndex: number, time: [number, number]) => {
    return {
        type: SET_TIME,
        channelIndex: channelIndex,
        time: time,
    }
}
