# pv-bugtracker

import PvBugtracker from "pv-bugtracker";

const pvBugtracker = new PvBugtracker({
    app_name: "Test App",                           // App name
    token_url: "https://example.com",                // Token url for Login 
    debug: true,                                    // Enable console logger
    bug_report_url: "https://example.com"           // Bug report url 
});


pvBugtracker.reprotBug({
    title: "bug title",
    priority: "bug priority",
    current: "bug current",
    expected: "bug expected",
    reporter: "reporter object"
})