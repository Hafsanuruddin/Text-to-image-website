# Text-to-Image Website

This is a web application that allows users to generate images from text descriptions using deep learning techniques.

## Features

- **Text-to-Image Generation:** Users can input textual descriptions, and the application generates corresponding images.
- **Image Upload:** Users can also upload images directly.
- **Various Models:** The application supports multiple deep learning models for generating images, allowing users to choose their preferred model.
- **User Authentication:** Users can create accounts and log in to save their generated images and preferences.
- **Image Gallery:** Saved images are displayed in a gallery format, making it easy for users to browse and manage their creations.
- **Responsive Design:** The website is designed to be accessible and user-friendly across different devices and screen sizes.

## Installation

1. **Clone the Repository:**

   ```
   git clone https://github.com/Hafsanuruddin/Text-to-image-website.git
   ```

2. **Install Dependencies:**

   ```
   pip install -r requirements.txt
   ```

3. **Run the Application:**

   ```
   python app.py
   ```

## Usage

- **Access the Website:** Open a web browser and navigate to http://localhost:5000.
  
- **Generate Images:**
  - Enter a textual description in the provided input field.
  - Alternatively, upload an image directly.
  - Select a deep learning model from the options available.
  - Click on the "Generate" button to create the image.
  
- **Save Images:**
  - If logged in, users can save generated images to their account.
  - Saved images can be accessed later from the user's gallery.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/improvement`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push your changes to the branch (`git push origin feature/improvement`).
5. Create a new Pull Request.

## Model Usage

### Maloney Model (Powered by Hugging Face)

Our application utilizes the Maloney model, provided by Hugging Face, for generating images from textual descriptions. To use this model:

- Select "Maloney" from the available deep learning models when generating images.
- Ensure that you have obtained the necessary API key from Hugging Face and configured it in the application settings.

We extend our appreciation to Hugging Face for providing access to this powerful deep learning model through their API.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

This project wouldn't have been possible without the contributions of various individuals and organizations. We would like to express our gratitude to:

- Hafsanuruddin for developing and sharing the initial version of this project.
- The creators and contributors of the deep learning models used in this project.
- Hugging Face for providing access to the Maloney model through their API.
```

