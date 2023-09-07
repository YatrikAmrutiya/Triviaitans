const functions = require('@google-cloud/functions-framework');
const language = require('@google-cloud/language');

// Initialize Google Cloud Natural Language API
const client = new language.LanguageServiceClient({
    keyFilename: './assignment-2-391222-9bd44afd3282.json', // Update with the path to your service account key JSON file
    projectId: 'assignment-2-391222', // Replace with your Google Cloud project ID
});

functions.http('serverless', async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        const { question } = req.body;
        console.log('Question:', question);

        let categories = [];

        // Split the question into tokens (words)
        const tokens = question.split(' ');

        // Check if the question has enough tokens to process
        if (tokens.length > 1) {
            // Call Google Cloud Natural Language API to analyze the question
            const [result] = await client.classifyText({
                document: {
                    content: question,
                    type: 'PLAIN_TEXT',
                },
            });

            categories = result.categories.map((category) => {
                const cleanedCategory = category.name.replace(/\//g, '').split(' ').pop();
                return cleanedCategory;
            });
        } else {
            console.log('Question has too few tokens to process.');
        }

        console.log('Categories:', categories);

        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error('Error processing question:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
