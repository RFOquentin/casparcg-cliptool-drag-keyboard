# CasparCG Cliptool

CasparCG ClipTool is a playout tool with a thumbnail based GUI.

## View Modes

Cliptool has a couple of view modes, accessed by adding different query parameters when accessing Cliptool.

-   No Extra parameters to the query, makes you enter the main view mode.
-   Adding `/?textview=1` to the query will enable the text view mode, where thumbnails for the cards are not rendered.
-   Adding `/?channel=1` to the query will enable the channel view mode, where the chosen tab is locked to the channel defined in the query.
    -   The channel number is 1-indexed. Given a 0, will give the first channel.
-   Adding `/?textview=1` and `/?channel=1` will enable the channel text view mode, which is a mix of both of the previously described modes.

Take note on the names used for the view modes, e.g 'main view', as they are likely to be used during the rest of this ReadMe.
Below example images of the main, text and channel view modes can be seen.

### Main View

<img src="docs/images/main-view.png" height="200">

### Text View

<img src="docs/images/text-view.png" height="200">

### Channel View

<img src="docs/images/channel-view.png" height="200">

## Features

### Header

In the header there is a button that can be used to open the [Settings Page](#settings).
This button is not visible while in the Text View

The header also contains a countdown of currently playing video file, or indicator that a image file is loaded.
In either instance, the thumbnail of the playing file will also be shown.

The header also contains 4 togglebuttons, Loop, Mix, Overlay and Manual.
The first 3 of them are not visible from the text view, but still in effect, if enable from another view mode.

More details about what these button do are described during their individual section under the [Settings Page](#settings).

Should the space for the header become limited, due to e.g a narrow window size,
then the header will be horizontally scrollable.

### Tabs

Each channel defined in CasparCG's configuration file coresponse to its own tab in Cliptool.

Tabs are only visible while while the view does not have a specified channel in the query.

Buttons located in the [header](#header) will directly impact settings related to the currently active tab.

The [label](#label) show on each tab can be set from the [settings page](#settings).
Should the space for the tabs become limited, due to e.g long tab names, then the header will be horizontally scrollable.

### Playout

Playing videos or images from Cliptool is as simple as placing them in the media folder that CasparCG is looking, and then clicking the associated thumbnail in Cliptool.
Depending on the different toggle switches in the header, slightly different outcomes might happen.

When a image file is played it will get a red border and the text 'SELECTED'.
This will also be shown in the header.

<img src="docs/images/playing-image.png" height="100">

When a video file is played it will get a red border and text showing the remaining duration.
This will also be shown in the header.

<img src="docs/images/playing-video.png" height="100">

When a video file has been loaded, while [Manual](#manual) mode has been enabled from the header or settings page,
it will be shown with a green border and the text 'CUED'.

<img src="docs/images/loaded-video.png" height="100">

### Hiding

It is possible to hide files from being shown in Cliptool.
This is ideal if multiple small variation of the same file is generated and placed in CasparCG's media folder, but only one is desired to be used.

To hide files, first the operation mode of a channel, on which you wish to hide files, must be changed.
The operation mode of a channel can be selected from a dropdown on the settings page.
This is described in more detail during the [Operation Mode](#operation-mode) section under Settings.

Ones in the 'Edit Visibility' operation mode, then clicking on files will toggle their visibility, ones out of the 'Edit Visibility' operation mode.
Files that are currently marked to be hidden will be shrunken, greyed out with a brown background.
Image showing this can be seen below.

<img src="docs/images/hidden-file.png" height="200">

To return to the normal operation mode, either change the dropdown for the channel in settings back to 'Control',
or hit the 'Exit Edit Visibility' button in the page footer shown while in the 'Edit Visibility' operation mode.

### Recovery

Should Cliptool loss connection to CasparCG at some point, and then regain connection, it will resend the play commands.
If a channel is already playing something, Cliptool will skip that channel, as to not disturb what's playing.

Should Cliptool crash or otherwise restart, and a change to what's playing on CasparCG be done in the meantime, then Cliptool will update accordingly on startup.
This means that the selected or loaded file indicator will update in Cliptool, if CasparCG is send a command from outside, during Cliptools downtime.

### Touch Support

Cliptool has support for Touch, allowing the user to change the active tab by swiping left and right in the main area, where files are being displayed.
If space is limited such that the [header](#header) or [tabs](#tabs) have become scrollabe, these will also be scrollable via touch.

## Settings

Clicking the 'Settings' button in the header will open the Settings page.
An image showing the Settings page can be seen below, as seen from the Main View.

<img src="docs/images/settings.png" height="400">

Settings are split into 3 parts.

-   Buttons
    -   'Restart Cliptool' button is not shown if Settings is entered from the Channel View
-   CasparCG settings
    -   Is not shown if Settings is entered from the Channel View.
-   Channel settings, which are named outputs in Cliptool.
    -   Only the one defined in the query is seen if Settings is entered from the Channel View.

### Buttons

#### Save Settings

If no changes have been made, then this button does nothing.

If changes has been made, then this button prompts the user, if they wish to save their changes.
If cancelled, the prompt simply closes.
If accepted, then the changes are saved, and the settings page is closed.

#### Close Settings

When no changes has been made this button will be displayed with the text 'Close Settings',
and on clicking it will simply do as the button states.

If changes have been made the text displayed will update to display 'Discard Changes & Close Settings'.
Upon clicking it while changes have been made, the user will be prompted if they truly wish to discard changes.
If cancelled, the prompt simply closes.
If accepted, then the changes are discarded, and the settings page is closed.

#### Restart Cliptool

As noted earlier in the Settings section, this button is not accessible from the Channel View.

When clicked it simply makes Cliptool stop.
Cliptool, along with CasparCG and Media Scanner, tends to be run through **CasparCG Launcher**
When a process handled by **CasparCG Launcher** exits, then **CasparCG Launcher** will restart it immediately.
This is what Cliptool leverages, for its restart functionality.
As such it should be noted that this button will not Restart Cliptool, if not running from **CasparCG Launcher**.

How to get **CasparCG Launcher** is described further down, in the [CasparCG Launcher Section](#casparcg-launcher).

### CasparCG Options

In Cliptool there are a few settings related to CasparCG, which can be updated from the Settings Page.
These mainly revolves around where to send requests to CasparCG, and some playout options.

<img src="docs/images/casparcg-settings.png">

#### Ip Address

This fields defines where Cliptool will attempt to send its request meant for CasparCG.
If the [Installation Guide](#installing-cliptool) further down has been followed,
then this should remain as shown on the image.

#### Amcp Port

The port on which Cliptool will send Amcp request to CasparCG.

#### Osc Port

The port on which Cliptool will receive Osc message from CasparCG.

#### Default Layer

The layer which playout will place played or loaded files on.

#### Transition Time

The time in frames that a change some file A to file B takes, while using [Mix](#mix).
25 frames equals 1 second.

### Channel / Output Options

Each output has a number of option that can be updated from the Settings Page.

<img src="docs/images/output-settings.png">

#### Label

Setting a text in label field, will update the text shown on the associated tab, while on the Main or Text view.
If nothing is specified, then the tab will simply display 'Output', followed by the number of the output.

#### Media Folder

Selecting a folder from the dropdown, will narrow in the files shows in the associated tab.
The options available include a blank one, which will show all files in CasparCG's media folder,
and an option for each sub-folder in CasparCG's media folder, including sub-folders of those folders ad infinitum.

#### Operation Mode

Changing the selected option in this dropdown will change what happens when a file is clicked, on the associated tab.
There are two Operation modes, _Control_ and _Edit Visibility_, with _Control_ being the default mode.

While in _Control_ mode you will be able to send play and load commands to CasparCG by clicking on files.
In this mode files marked to be hidden, will not be shown.

While in _Edit Visibility_ mode you will be able to toggle the visibility of files by clicking on them.
In this mode files marked to be hidden, will be shown.
The [Hiding](#hiding) section earlier describes hiding of files in more detail.

#### Loop

Defines if playing video files on the associated tab should loop indefinetly.

#### Mix

Defines if playing files on the associated tab should use a mix effect when changing from one file to another.
How long time the transition takes is defined by [Transition Time](#transition-time) under CasparCG settings.

#### Manual

Defines if video files should be manually started on the associated tab.
While enabled a new button will be visible in the header, which allows the user to start a loaded video file.

#### Overlay

Defines if the Url in [Overlay Orl](#overlay-url) should be loaded and shown over files played on the associated tab.

#### Overlay Url

Defines the Url that should be shown while the [Overlay](#overlay) is active on the associated tab.

#### Scaling

Defines if a played file should be scaled to some fixed dimensions.
While enabled two new fields will be shown, allowing the user to set a desired X and Y size in pixels.

<img src="docs/images/scaling.png">

## Installing Cliptool

Cliptool is prebuilt for Windows. Simply download the desired version from the [release page](https://github.com/tv2/casparcg-cliptool/releases).
Ones you have downloaded the desired version of `casparcg-clip-tool.exe`, drop it into the folder for CasparCG.

### Important

For Cliptools timer and preview of selected file in the header to work,
CasparCG's `casparcg.config` file needs to have an `osc` section.

The default config file contains a out-commented version of the `osc` section.
That section should be moved to be part of the configuration, and of course un-commented.

In case the config file has removed it for some reason, the `osc` section can also be found below.

```
<osc>
  <default-port>6250</default-port>
  <disable-send-to-amcp-clients>false [true|false]</disable-send-to-amcp-clients>
  <predefined-clients>
    <predefined-client>
      <address>127.0.0.1</address>
      <port>5253</port>
    </predefined-client>
  </predefined-clients>
</osc>
```

### CasparCG Launcher

Cliptool works great with the CasparCG Launcher, and it is also highly recommended that Cliptool is run by use of CasparCG Launcher, for the restart capability.
CasparCG Launcher can be downloaded from its [release page](https://github.com/nrkno/tv-automation-casparcg-launcher/releases).

Once CasparCG Launcher is downloaded and placed inside the CasparCG folder, simply add "casparcg-clip-tool.exe" as a process under settings.
With the CasparCG Launcher placed inside the CasparCG folder, the 'Base Path' should simply be set to '`./`'

## Running Cliptool

To run Cliptool either start Cliptools, CasparCG and Media Scanner executables yourself or start CasparCG Launcher, and start the 3 programs from there.
The order of starting the programs doesn't matter.

After Cliptool has started, then the GUI can be accessed from a browser at [localhost:5555](http://localhost:5555).
From that address the query parameters specified in [View Modes](#view-modes) can be suffixed to alter what or how things are shown.

For easy access and example, the suffixed view modes links are listed below.

-   [Text View](http://localhost:5555/?textview=1)
-   [Channel View](http://localhost:5555/?channel=1)
-   [Text Channel View](http://localhost:5555/?channel=1&textview=1)

## Installing Cliptool Gateway

Cliptool Gateway is prebuilt for Windows. Simply download the desired version from the [release page](https://github.com/tv2/casparcg-cliptool/releases).
Ones you have downloaded the desired version of `cliptool-gateway.exe`, drop it into the folder for CasparCG.

## Running Cliptool Gateway

Cliptool Gateway allows Cliptool to be controlled from outside by use of OSC and/or AMP remote control protocols.

The `cliptool-gateway.exe` file is used for remote controlling ClipTool from e.g. a video mixer.

For the Cliptool Gateway to work, Cliptool itself also needs to run.
Another requirement of the Cliptool Gateway is that it needs an arguement upon start to determin if it should use OSC or AMP.

The argument can be supplied in any way you want. Examples include but are not liminted to.

-   Giving it as an argument to a shortcut
-   Giving it as an argument when executing from commandline.
-   Giving is as an argument when configuraing with CasparCG Launcher.

### AMP Protocol

To start Cliptool Gateway as an AMP gateway, then the argument `-type=amp` has to be given to the execuable at launch.
There is a couble of ways to supply the arguement.
Regardless of how it is supplied, the Cliptool Gateway will create an AMP gateway on port 3811.

-   Shortcut

```
Target: "<your-casparcg-server-installation-folder>\cliptool-gateway.exe" -type=amp
```

-   Commandline

```
cd <your-casparcg-server-installation-folder>
cliptool-gateway.exe -type=amp
```

-   CasparCG Launcher Argument

```
Executable: cliptool-gateway.exe
Arguments: -type=amp
```

### OSC Protocol

To start Cliptool Gateway as an OSC gateway, then the argument `-type=osc` has to be given to the execuable at launch.
There is a couble of ways to supply the arguement.
Regardless of how it is supplied, the Cliptool Gateway will create an OSC gateway on port 5256.

-   Shortcut

```
Target: "<your-casparcg-server-installation-folder>\cliptool-gateway.exe" -type=osc
```

-   Commandline

```
cd <your-casparcg-server-installation-folder>
cliptool-gateway.exe -type=osc
```

-   CasparCG Launcher Argument

```
Executable: cliptool-gateway.exe
Arguments: -type=osc
```

The OSC protocol has the following commands.

```
/channel/{output}/play
/channel/{output}/load
```

## Development

To get started with development, clone this repository to a local location

```
git clone https://github.com/tv2/casparcg-cliptool.git nameofyourproject
```

After doing that, follow the following subsections.

### Building

To build Cliptool run the following commands.

```
yarn
yarn build
```

#### Watching for Changes

To watch for changes to client, server and gateway, run the following command.

```
yarn watch-changes
```

If one wish to split the watch into multiple terminals the underlying '`yarn watch-client`', '`yarn watch-server`' and '`yarn watch-gateway`' can be used.

### Running

To run Cliptool for development purposes, it is recommended to [watch for changes](#watching-for-changes), therefore a minimum of two terminals are needed.
One terminal will be watching for changes and one will run Cliptool.
For running Cliptool, there are 3 commands to chose from, depending on the desired log level.

For production level logs use the following command.

```
yarn start
```

For development level logs use the following command.

```
yarn start-dev
```

For trace level logs use the following command.

```
yarn start-local
```

Ones running, navigate to the address as if run from an executable, specified during [Running Cliptool](#running-cliptool)

### Packaging

To create a packaged executable of Cliptool and Cliptool Gateway, ready for release, run the following commands from the root of your cloned repository.

```
yarn build
yarn package
```

## Noteworthy Packages:

Cliptool makes use of SuperflyTV's CasparCG-Connection ACMP protocol:

```
https://github.com/SuperFlyTV/casparcg-connection
```
