import * as Bowser from "bowser";
import * as axios from "axios";
import _ from "lodash";

const TOKEN_URL = "https://zefr.app/api/reporters";
const BUG_REPORT_URL = "https://zefr.app/api/report-bug";

class PvBugTracker {
    constructor(options = {}) {
        this._debug = !!options.debug;
        this._is_enabled = false;
        this._metadata = this._getMetadata();

        if (options.app_name) {
            this.app_name = options.app_name;
        } else {
            this._log("PvBugTracker::constructor()", "'app_name' is invalid");
            return;
        }

        this.token_url = options.token_url || TOKEN_URL;
        this.bug_report_url = options.bug_report_url || BUG_REPORT_URL
        this._is_enabled = typeof window === "object";
    }

    reprotBug(data) {
        if (!data.reporter && typeof data.reporter !== "object") {
            this._log("PvBugTracker::constructor()", "reporter is invalid");
            throw "reporter is invalid";
        } else if (_.has(data.reporter, ["name", "email"])) {
            this._log("PvBugTracker::constructor()", "reporter name or email is invalid");
            throw "reporter name or email is invalid";
        }

        return this._getToken(data.reporter)
            .then((token) => {
                console.log(token)
                this._createBug(token, data)
            });
    }

    _getBrowserDetails() {
        if (typeof window === "object") {
            return Bowser.getParser(window.navigator.userAgent);
        }
        return null;
    }

    _getPageUrl() {
        if (typeof window === "object") {
            return window.location.href;
        }

        return null;
    }

    _getMetadata() {
        const metadata = {
            page_url : this._getPageUrl()
        };
        const browser = this._getBrowserDetails();
        if (browser) {
            const browserData = browser.getBrowser();
            metadata.device_version = _.join([browserData.name, browserData.version], ' ');
            metadata.device_type = browser.getPlatform().type;
        }
        return metadata;
    }

    _getToken(params) {
        return axios.post(
                this.token_url,
                params,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json, */*"
                    }
                }
            )
            .then((response) => {
                if (response.data.status) {
                    return response.data.data;
                } else {
                    this._log("PvBugTracker::_getToken()", "Token api call error ...");
                }
            })
            .catch((error) => {
                throw error;
            });
    }

    _createBug(token, data) {
        let fd = new FormData();
        fd.append("title", data.title);
        fd.append("priority", data.priority || "normal");
        fd.append("current", data.current);
        fd.append("expected", data.expected);
        fd.append("page_url", this._metadata.page_url);
        fd.append("device_version", this._metadata.device_version);
        fd.append("device_type", this._metadata.device_type);
        fd.append("client_name", this.app_name);

        if (data.file) {
            fd.append("screenshot", data.file.blob, data.file.name);
        }

        return axios.post(
            this.bug_report_url,
            fd,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json, */*",
                    "X-Requested-With": "XmlHttpRequest",
                    Authorization: "Bearer " + token
                }
            }
        )
        .then((response) => {
            if (response.data.status) {
                return response.data.data.bugs;
            } else {
                this._log("PvBugTracker::_createBug()", "Token api call error ...");
            }
        })
        .catch((error) => {
            throw error;
        });
    }

    _log(...data) {
        if (this._debug) {
            console.log("[PvBugTracker]", ...data);
        }
    }
}

export default PvBugTracker;
