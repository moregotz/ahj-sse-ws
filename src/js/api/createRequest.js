const createRequest = async (options) => {
    const { url, method = 'GET', body, responseType = 'json' } = options;

    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    const result = responseType === 'json' ? await response.json() : await response.text();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
};

export default createRequest;
