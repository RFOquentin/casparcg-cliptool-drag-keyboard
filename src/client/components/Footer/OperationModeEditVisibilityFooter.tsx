import React from "react"
import { OperationMode } from "../../../model/reducers/mediaReducer"
import { reduxState } from "../../../model/reducers/store"
import * as IO from '../../../model/SocketIoConstants'
import { socket } from '../../util/SocketClientHandlers'
import { Footer } from "./Footer"
import "../../css/Operation-mode-edit-visibility-footer.css"

const BUTTON_TEXT = 'Exit Edit Visibility'
const DESCRIPTION_TEXT = 'You are currently editing the visibility of files.'.toUpperCase()

function resetOperationMode(): void {
  socket.emit(
    IO.SET_OPERATION_MODE, 
    reduxState.appNav[0].activeTab, 
    OperationMode.CONTROL
  )
}

export function OperationModeEditVisibilityFooter(): JSX.Element {
  return (        
      <Footer>
        <div className="operation-mode-edit-visibility-footer">
          <div className="operation-mode-edit-visibility-footer__text">
            { DESCRIPTION_TEXT }
          </div>
          <div className="operation-mode-edit-visibility-footer__controls">
            <button onClick={ resetOperationMode }>{ BUTTON_TEXT }</button>
          </div>
        </div>
      </Footer>
  )
}