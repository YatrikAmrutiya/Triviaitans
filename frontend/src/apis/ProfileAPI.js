import axios from "axios";

// API handler utility function is required to handle API requests
const { apihandler } = require("../helpers/apiHandler");

// Edit user profile with provided firstName, lastName, and email
const editProfile = async (firstName, lastName, email) => {
    return apihandler.patch("/profile/profile-edit", { firstName, lastName, email });
}

// Get a pre-signed URL for profile picture upload
const getPresignedUrl = async (profilePicture, fileName) => {
    return apihandler.put("/profile/profile-pic", { profilePicture, fileName });
}

// Upload the profile picture to the S3 bucket using the provided URL and file
const uploadImageToS3 = async (uploadUrl, file) => {
    return axios.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
        },
    });
}

// Save user notification settings with the selected values
const saveNotificationSettings = async (selectedValues) => {
    return apihandler.post("/profile/save-notification-settings", { selectedValues });
}

// Get the current user's profile
const getUser = async () => {
    return apihandler.get("/profile/get-user");
}

// Get user details by email
const getUserByEmail = async (email) => {
    return apihandler.get(`/profile/get-user/${email}`);
}

// Get user statistics
const getUserStatistics = async () => {
    return apihandler.get("/profile/get-user-stats");
}

// Get user statistics by userName
const getUserStatisticsByUserName = async (userName) => {
    return apihandler.get(`/profile/get-user-stats/${userName}`);
}

export {
    editProfile,
    getPresignedUrl,
    uploadImageToS3,
    saveNotificationSettings,
    getUser,
    getUserByEmail,
    getUserStatistics,
    getUserStatisticsByUserName
};