import React from 'react'
import { useSelector } from 'react-redux'
import { OperationMode } from '../../../model/reducers/settingsReducer'
import { ReduxStateType } from '../../../model/reducers/store'
import appNavigationService from '../../../model/services/appNavigationService'
import { OperationModeEditVisibilityFooter } from './OperationModeEditVisibilityFooter'

export function OperationModeFooter(): JSX.Element {
  const operationMode: OperationMode = useSelector((storeUpdate: ReduxStateType) =>
    storeUpdate.settings[0].generics.outputs[appNavigationService.getActiveTab()]?.operationMode)

  switch (operationMode) {
    case OperationMode.EDIT_VISIBILITY: {
      return <OperationModeEditVisibilityFooter />
    }
    case OperationMode.CONTROL:
    default: {
      return <></>
    }
  }
}