import React from "react";
import { useSelector } from "react-redux";
import { State } from "../../../../shared/reducers/index-reducer";
import { CasparcgConfigChannel, OutputSettings } from "../../../../shared/models/settings-models";
import { BrowserService } from "../../../shared/services/browser-service";
import Output from "../output/output";

interface OutputsFormProps {
    outputSettings: OutputSettings[]
    onChange: (changedOutput: OutputSettings[]) => void
}

export default function OutputsForm(props: OutputsFormProps): JSX.Element {
    const browserService = new BrowserService()
    const isChannelView = browserService.isChannelView()
    const casparcgConfig = useSelector((state: State) => state.settings.ccgConfig)
    const folders: string[] = useSelector((state: State) => state.media.folders)

    function onOutputChanged(changedOutput: OutputSettings, outputIndex: number): void {
        props.outputSettings[outputIndex] = changedOutput
        props.onChange(props.outputSettings)
    }

    return (
        <div>
            {
                isChannelView
                    ? renderSingleOutput(browserService, props.outputSettings, casparcgConfig.channels, folders, onOutputChanged)
                    : renderMultipleOutputs(props.outputSettings, casparcgConfig.channels, folders, onOutputChanged)
            }
        </div>
    )
}

function renderSingleOutput(browserService: BrowserService, outputSettings: OutputSettings[], casparcgChannels: CasparcgConfigChannel[], folders: string[], onChange: (changedOutput: OutputSettings, index: number) => void ): JSX.Element {
    const channel = browserService.getChannel()
    return buildSingleOutput(
        outputSettings[channel], 
        casparcgChannels[channel], 
        channel,
        folders,
        onChange
    )
}

function renderMultipleOutputs(outputSettings: OutputSettings[], casparcgChannels: CasparcgConfigChannel[], folders: string[], onChange: (changedOutput: OutputSettings, index: number) => void): JSX.Element[] {
    return casparcgChannels.map(
        (channel, index) => {
            const outputSetting = outputSettings[index]
            return buildSingleOutput(outputSetting, channel, index, folders, onChange)
        }
    )
}   

function buildSingleOutput(outputSettings: OutputSettings, configChannel: CasparcgConfigChannel, outputIndex: number, folders: string[], onChange: (changedOutput: OutputSettings, index: number) => void): JSX.Element {
    return (
        <Output 
            index={outputIndex}
            configChannel={configChannel}
            outputSettings={outputSettings}
            key={outputIndex}
            folders={folders}
            onChange={(changedOutput: OutputSettings) => onChange(changedOutput, outputIndex)}
        />
    )
}