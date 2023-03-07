import { IOutput, IThumbnailFile } from '../../model/reducers/mediaReducer'
import { reduxState } from '../../model/reducers/store'

class MediaService {
    // TODO: during UT-210, figure out the correct type to apply instead of 'any'.
    public getOutput(store: any, channelIndex: number = -1): IOutput {
        const activeTab: number =
            channelIndex === -1 ? reduxState.appNav[0].activeTab : channelIndex
        return store.media[0].output[activeTab]
    }

    public findThumbnail(fileName: string, channelIndex: number): string {
        const thumbnailFile = this.getOutput(
            reduxState,
            channelIndex
        )?.thumbnailList.find(
            (item: IThumbnailFile) =>
                item.name.toUpperCase() === fileName.toUpperCase()
        )
        return thumbnailFile?.thumbnail ?? ''
    }

    public getActiveTab(): number {
        return reduxState.appNav[0].activeTab
    }

    public isThumbnailWithTally(thumbnailName: string): boolean {
        const tallyNoMediaPath = this.getCleanTallyFile(
            this.getOutput(reduxState)
        )
        return tallyNoMediaPath === thumbnailName
    }

    public isThumbnailWithTallyOnAnyOutput(thumbnailName: string): boolean {
        return reduxState.media[0].output.some(
            (output) => this.getCleanTallyFile(output) === thumbnailName
        )
    }

    getCleanTallyFile(output: IOutput): string {
        const tallyFileName = output.tallyFile
            .toUpperCase()
            .replace(/\\/g, '/')
            .replace('//', '/')
            .split('.')
        // Remove system Path e.g.: D:\\media/:
        const tallyNoMediaPath = tallyFileName[0].replace(
            reduxState.settings[0].ccgConfig.path
                ?.toUpperCase()
                .replace(/\\/g, '/') + '/',
            ''
        )
        return tallyNoMediaPath
    }

    public secondsToTimeCode(
        timer: [number, number] = [0, 0],
        frameRate: number = 25
    ): string {
        if (timer[1] <= 0) {
            return 'SELECTED'
        }

        const time = Math.max(0, timer[1] - timer[0])
        if (time === 0) {
            return '****END****'
        }

        const hours = Math.floor(time / (60 * 60))
        const minutes = Math.floor((time % (60 * 60)) / 60)
        const seconds = Math.floor(time % 60)
        const frames = Math.floor((time % 1) * frameRate)
        return `${this.leadingZero(hours)}:${this.leadingZero(
            minutes
        )}:${this.leadingZero(seconds)}.${this.leadingZero(frames)}`
    }

    leadingZero(num: number, length: number = 2): string {
        const text = num.toString()
        const zeros = '0'.repeat(Math.max(0, length - text.length))
        return `${zeros}${text}`
    }
}

const instance: MediaService = new MediaService()
export default instance
