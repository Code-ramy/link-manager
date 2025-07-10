# Link Manager Application

"Link Manager" is a modern and elegant interface for organizing your favorite web applications and links in one place. It is designed to be fast, interactive, and easy to use, with a focus on an enjoyable user experience.

### Key Features and Functionality

*   **Link Management:** Easily add, edit, and delete your web application links.
*   **Custom Categories:** Create categories with custom names and icons to effectively organize your links.
*   **Drag and Drop:** Reorder applications within each category with ease using drag and drop.
*   **Automatic Data Fetching:** When adding a new link, the application attempts to automatically fetch the site name and favicon to simplify the process.
*   **Import and Export:** You can save all your data (applications and categories) to a JSON file for export or later import, ensuring your data is never lost.
*   **Local Storage:** All your data is securely stored in your browser using Local Storage.

### Design and User Interface

*   **Color Palette:** The application uses a sleek dark mode color scheme with a dynamic, gradient background. A bright blue is used as the primary accent color to highlight interactive elements.
*   **Glassmorphism:** Key UI components like the category filter bar and dialog modals use semi-transparent glass effects, giving them depth and a modern look.
*   **Icons:** Icons are carefully selected from the `lucide-react` library to be clear and consistent throughout the application.
*   **Animations:**
    *   **Button-Press:** All buttons respond to clicks with a subtle and smooth press-down effect (`active:scale`).
    *   **Grid Animation:** Applications in the grid appear with a staggered animation (`staggerChildren`) when the filter changes.
    *   **Dialogs:** Modals appear and disappear with smooth fade-and-scale transitions (`dialog-in`, `dialog-out`).

### Tech Stack and Frameworks

*   **Next.js & React:** The application is built with the Next.js framework and the React library, ensuring high performance and an interactive experience.
*   **TypeScript:** To ensure code quality and reduce errors.
*   **Tailwind CSS:** For building a fast and responsive user interface.
*   **ShadCN UI:** A set of pre-built, customizable UI components based on Tailwind CSS.
*   **Genkit (for AI):** The application is equipped with the Genkit framework to easily add artificial intelligence features in the future.
