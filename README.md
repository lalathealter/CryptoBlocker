# CryptoBlocker Chrome extension

This a simple Proof-of-Concept prototype that is meant for exploring and testing various defensive mechanisms against cryptojacking scripts on the web.

## How does it work

Currently, there are exactly two defensive techniques implemented: the blacklisting and the CPU usage tracking. 

The first one is rather straightforward - we have a list of online Google Sheets that contain known-malicious domains, which we scrape with the help of [opensheet.elk.sh API](https://github.com/benborgers/opensheet) and save to a localStorage object of a user's browser. Whenever a client is about to make a request to a domain that is mentioned in a blacklist, we reject it immediately. PLEASE NOTE that the list presented in the source code is by no means complete or is suitable for deducting cryptojacking-infected websites, as it's rather outdated and serves no purpose beside testing the functionality of our blacklisting mechanism.

The second one is a little more tricky, as it utilizes a Chrome Browser's API to detect suspiciously high spikes in CPU consumption.If a browser's process exceeds a set threshold (that's defined in percents of overall CPU load), it gets to be analyzed. An analysis stage goes for a set amount of time (that's defined in milliseconds), during which we collect any change of the CPU usage by that process. Once the time is off and the average CPU consumption exceeds our threshold, we notify our user with a popup presenting some options, which are to ignore, to whitelist or to blacklist a website. Both analysis time and CPU threshold can be changed in the extension's settings menu. PLEASE NOTE that the employed chrome.processes API is only available in a Dev Channel version of a Chrome Browser and isn't yet accessible to other versions (as of July 5th, 2023), so the Chrome Dev Channel Browser is the only version that could run this extension.

### Installation

To install this, please follow a default procedure of installing a custom extension as it's explained at [Google's extension development guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/) 
