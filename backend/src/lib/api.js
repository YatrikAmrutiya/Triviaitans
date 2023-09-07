const sendHTTPResponse = (statusCode, body, headers = {}, cachePrivately = true, cacheDuration = 0) => {
    const cacheType = cachePrivately ? "private" : "public";
    const response = {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            ...headers
        },
        isBase64Encoded: false,
        body: JSON.stringify(body)
    };
    if (cacheDuration > 0) {
        response.headers["Cache-Control"] = `${cacheType}, max-age=${cacheDuration}`;
    }
    return response;
};

module.exports = {
    sendHTTPResponse
};
