import React from "react"
import { useSelector } from "react-redux"
import { HiddenFileInfo, MediaFile } from "../../../model/reducers/mediaReducer"
import mediaService from "../../../model/services/mediaService";
import ThumbnailButton from "./ThumbnailButton";
import ThumbnailPicture from "./ThumbnailPicture";
import TimeCode from "./TimeCode";
import '../../css/Thumbnail.css'
import { ReduxStateType } from "../../../model/reducers/store";
import settingsService from "../../../model/services/settingsService";

interface ThumbnailUsingImageProps {
  file: MediaFile
}

export default function ThumbnailUsingImage(props: ThumbnailUsingImageProps): JSX.Element {
  // Redux hook:
  useSelector(
    (storeUpdate: ReduxStateType) => settingsService.getOutputSettings(storeUpdate)
            .selectedFile
  )

  const hiddenFiles: Record<string, HiddenFileInfo> = useSelector(
      (storeUpdate: ReduxStateType) => 
          storeUpdate.media[0].hiddenFiles
  ) ?? {}

  const classNames: string = [
      'thumb',
      props.file.name in hiddenFiles ? 'hidden' : ''
  ].join(' ')

  return (
    <div className={classNames}>
        <ThumbnailPicture file={props.file} />
        <ThumbnailButton file={props.file} />
        {mediaService.isThumbnailWithTally(props.file.name) ? (
            <TimeCode file={props.file} />
        ) : (
            ''
        )}
        <p className="text">
            {props.file.name
                .substring(props.file.name.lastIndexOf('/') + 1)
                .slice(-45)}
        </p>
    </div>
  )
}

