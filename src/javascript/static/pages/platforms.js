const BinarySocket   = require('../../app/base/socket');
const isIndonesia    = require('../../app/common/country_base').isIndonesia;
const getElementById = require('../../_common/common_functions').getElementById;
const TabSelector    = require('../../_common/tab_selector');
const isBinaryApp    = require('../../config').isBinaryApp;
const { OSDetect }   = require('../../_common/os_detect');

const os_list = [
    {
        name    : 'mac',
        url_test: /\.dmg$/,
    },
    {
        name    : 'windows',
        url_test: /\.exe$/,
    },
    // {
    //     name    : 'linux',
    //     url_test: /x86_64\.AppImage$/,
    // }
];

const Platforms = (() => {
    const onLoad = () => {
        BinarySocket.wait('website_status').then(() => {
            $('.desktop-app').setVisibility(isIndonesia() && !isBinaryApp());
        });
        TabSelector.onLoad();
        $.getJSON('https://api.github.com/repos/binary-com/binary-desktop-installers/releases/latest', (data = { assets: [] }) => {
            data.assets.some((asset) => {
                if (os_list.every(os => os.download_url)) {
                    return true;
                }
                os_list.forEach(os => {
                    if (!os.download_url && os.url_test.test(asset.browser_download_url)) {
                        os.download_url = asset.browser_download_url;
                    }
                });
                return false;
            });
            os_list.forEach(os => {
                const el_button = getElementById(`app_${os.name}`);
                el_button.setAttribute('href', os.download_url);
            });
        });
        fetch('https://grid.binary.me/version.json')
            .then(response => response.json())
            .then(gridapp => {
                $('.download-grid-app').attr('href', `https://grid.binary.me/download/${gridapp.name}`);
            });
        const os = OSDetect();
        const desktop_button = document.querySelector('.desktop-download-grid-app');
        const android_app = document.querySelector('.android-download-grid-app');
        if (os === 'ios') {
            const ios_message = document.querySelector('.ios-download-grid-app');
            ios_message.classList.remove('invisible');
            desktop_button.classList.add('invisible');
            android_app.classList.add('invisible');
        } else if (os === 'android') {
            desktop_button.classList.add('invisible');
        }

    };

    return {
        onLoad,
    };
})();

module.exports = Platforms;
