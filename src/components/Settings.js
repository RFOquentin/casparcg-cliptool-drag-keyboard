import React, { Component } from 'react';
import '../assets/css/Settings.css';

//Redux:
import { connect } from "react-redux";

//Utils:
import { saveSettings } from '../util/SettingsStorage';

class SettingsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            settings: this.props.store.settingsReducer[0].settings,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleTabDataTitle = this.handleTabDataTitle.bind(this);
        this.handleTabDataFolder = this.handleTabDataFolder.bind(this);
        this.handleTabDataOverlayFolder = this.handleTabDataOverlayFolder.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderChannelSettings = this.renderChannelSettings.bind(this);
    }

    componentDidMount() {
    }

    handleChange(event) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy[event.target.name] = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleTabDataTitle(event) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.tabData[event.target.name].title = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleTabDataFolder(event) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.tabData[event.target.name].subFolder = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleTabDataOverlayFolder(event) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.tabData[event.target.name].overlayFolder = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleSubmit(event) {
        saveSettings(this.state.settings);
    }

    renderChannelSettings(item, index) {
        return (
            <div className="Settings-channel-form" onSubmit={this.handleSubmit}>
                <label className="Settings-input-field">
                    OUT {index+1} :
                    <input name={index} type="text" value={item.title} onChange={this.handleTabDataTitle} />
                </label>
                <label className="Settings-input-field">
                    SUBFOLDER :
                    <input name={index} type="text" value={item.subFolder} onChange={this.handleTabDataFolder} />
                </label>
                <label className="Settings-input-field">
                    OVERLAYFOLDER :
                    <input name={index} type="text" value={item.overlayFolder} onChange={this.handleTabDataOverlayFolder} />
                </label>
            </div>
        )
    }

    render() {
        return (
            <div className="Settings-body">
            <p className="Settings-header">SETTINGS :</p>
            <form className="Settings-form" onSubmit={this.handleSubmit}>
                <label className="Settings-input-field">
                    IP ADDRESS :
                    <input name="ipAddress" type="text" value={this.state.settings.ipAddress} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="Settings-input-field">
                    PORT :
                    <input name="port" type="text" value={this.state.settings.port} onChange={this.handleChange} />
                </label>
                <br/>
                {this.renderChannelSettings(this.state.settings.tabData[0], 0)}
                {this.renderChannelSettings(this.state.settings.tabData[1], 1)}
                {this.renderChannelSettings(this.state.settings.tabData[2], 2)}
                {this.renderChannelSettings(this.state.settings.tabData[3], 3)}
                <input className="Save-button" type="submit" value="SAVE SETTINGS" />
            </form>
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(SettingsPage);
