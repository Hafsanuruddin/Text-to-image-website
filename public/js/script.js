const QTable = {};
const learningRate = 0.1; // Alpha
const discountFactor = 0.9; // Gamma

// Function to update the RL model based on rewards using Q-learning
function updateModel(state, action, reward, nextState) {
    QTable[state] = QTable[state] || {};
    QTable[nextState] = QTable[nextState] || {};

    const currentQValue = QTable[state][action] || 0;
    const maxNextQValue = Math.max(...Object.values(QTable[nextState] || {}), Number.NEGATIVE_INFINITY);
    const updatedQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue);

    QTable[state][action] = updatedQValue;
}

// Function to generate image from text using reinforcement learning
async function generateImageWithRL(text) {
    const token = "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";
    const endpoint = "https://api-inference.huggingface.co/models/Melonie/text_to_image_finetuned";
    try {
        console.log('Sending request to generate image...');
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "inputs": text })
        });
        if (!response.ok) {
            console.error('Failed to generate image:', response.statusText);
            throw new Error('Failed to generate image. Please try again.');
        }
        const result = await response.blob();
        const imageUrl = URL.createObjectURL(result);
        console.log('Image generated successfully, saving image URL...');
        await saveGeneratedImage(imageUrl);

        return imageUrl;
    } catch (error) {
        console.error('Error in generateImageWithRL:', error);
        throw new Error('Failed to generate image. Please try again.');
    }
}

// Function to calculate reward based on the generated image
async function calculateReward(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image. Please try again.');
        }
        const blob = await response.blob();
        const img = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let bluePixelCount = 0;
        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            if (blue > 100 && red < 50 && green < 50) {
                bluePixelCount++;
            }
        }
        const reward = bluePixelCount / (canvas.width * canvas.height / 1000);
        console.log('Reward:', reward);
        return reward;
    } catch (error) {
        throw new Error('Failed to calculate reward. Please try again.');
    }
}

// Function to save the generated image URL to the database
async function saveGeneratedImage(imageUrl) {
    try {
        const response = await fetch('/api/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl })
        });
        if (!response.ok) {
            throw new Error('Failed to save image to the database.');
        }
    } catch (error) {
        console.error('Error saving generated image:', error);
        throw error; // Ensure the error is thrown to propagate it further
    }
}

// Get DOM elements
const inputTxt = document.getElementById("input");
const image = document.getElementById("image");
const generateButton = document.getElementById("btn");
const saveButton = document.getElementById("saveBtn");
const feedbackMsg = document.getElementById("feedback");

// Event listener for generate button click
generateButton.addEventListener('click', async function () {
    try {
        feedbackMsg.textContent = '';
        const text = inputTxt.value.trim();
        if (text === '') {
            throw new Error('Please enter a text prompt.');
        }
        feedbackMsg.textContent = 'Generating image...';
        const generatedImageUrl = await generateImageWithRL(text);
        image.src = generatedImageUrl;
        
        // Calculate reward and update RL model
        const reward = await calculateReward(generatedImageUrl);
        updateModel(text, 'generate', reward, 'nextState');

        feedbackMsg.textContent = `Image generated successfully.`;
    } catch (error) {
        feedbackMsg.textContent = `Error: ${error.message}`;
        console.error("An error occurred:", error);
    }
});

// Event listener for save button click
saveButton.addEventListener('click', async function () {
    try {
        const generatedImageUrl = image.src;
        if (!generatedImageUrl) {
            throw new Error('No image generated.');
        }

        // Create a temporary anchor element
        const anchor = document.createElement('a');
        anchor.href = generatedImageUrl;
        anchor.download = 'generated_image.png'; // Set the filename here

        // Simulate a click on the anchor element to trigger the download
        anchor.click();

        feedbackMsg.textContent = 'Image saved successfully.';
    } catch (error) {
        feedbackMsg.textContent = `Error: ${error.message}`;
        console.error("An error occurred:", error);
    }
});
