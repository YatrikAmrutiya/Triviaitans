const { apihandler } = require("../helpers/apiHandler");

// This helper fetches the last timestamp of the time when user checked notifications
// and returns the notifications that are newer than that timestamp
// If the user has never checked notifications, it returns all notifications
// After fetching, we store the current timestamp in the local storage
const getNotifications = async () => {
    const timestamp = localStorage.getItem("notificationsTimestamp");
    // const timestamp = "2021-05-01T00:00:00.000Z";
    const request = apihandler.get(`/notifications?timestamp=${timestamp}`);
    localStorage.setItem("notificationsTimestamp", (new Date()).toISOString());
    return request;
}

export {
    getNotifications
};
