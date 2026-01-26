# Welcome to Boa Hora app 👋

## Project Plan: Boa Hora

### 1. Core Objective

Develop a single-screen mobile experience (React Native) that allows users to time contractions with one tap, view a history timeline, and receive simple guidance on when to head to the hospital, entirely in Brazilian Portuguese.

### 2. Tech Stack

Framework: React Native (via Expo) - Best for rapid mobile UI development.

Language: TypeScript - For robust logic handling.

State Management: React Hooks (useState/useEffect) - Sufficient for this level of complexity.

Storage: AsyncStorage - To save contraction history if the app is closed.

### 3. User Interface (UI) - PT-BR

Color Palette: Calming Mint Green (#4CD964 / #E0F8F7) and White, matching the screenshot.

Header:

Title: "CONTRAÇÕES"

Action Icons: Settings (gear), Baby (status), History (book).

Main Display (Top Half):

State A (Idle): A warning card: "Se a bolsa estourar ou houver sangramento significativo, vá para o hospital" and instructions "Cronometre várias contrações...".

State B (Active/History): Summary stats: "Última Hora: X contrações / Média Duração / Média Freq".

Timeline (Middle):

A scrollable vertical list connecting contraction nodes.

Columns: Start Time, Duration (Duração), Frequency (Freq).

Controls (Bottom):

A large, easy-to-hit circular button.

Idle Text: "CONTRAÇÃO começou"

Active Text: "PARAR" (with a timer counting up).

### 4. Business Logic

Start: Records startTime. Button turns red/active.

Stop: Records endTime. Calculates duration (endTime - startTime).

Frequency Calculation: Time difference between the startTime of the current contraction and the startTime of the previous one.

Hospital Alert: We will implement the standard "5-1-1 Rule" (or similar) as the default logic:

Contractions are 5 minutes apart (Frequency).

Lasting 1 minute each (Duration).

Pattern persists for 1 hour.

Notification: A prominent alert saying "Hora de ir para o hospital!"

---

## Technical Details

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Code source files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Coding Guidelines

Building high-quality Expo React Native apps involves adhering to best practices in project setup, code quality, architecture, and performance optimization.

### Project Setup and Code Quality

- Use TypeScript: Use TypeScript for type safety to prevent runtime errors and improve code clarity and maintainability.

- Enable ESLint and Prettier: Implement ESLint for enforcing React rules and identifying common issues, and Prettier for consistent code formatting across your team.

- Use ESM Syntax: Prefer import and export over require and module.exports for better static analysis and tree-shaking optimizations by the Expo CLI.

- Install Packages with npx expo install: This command automatically installs versions of packages compatible with your project's Expo SDK version, preventing dependency issues.

- Add an Error Boundary: Implement error boundaries to gracefully catch JavaScript errors within the UI, preventing native app crashes and displaying a user-friendly fallback UI.

- Configure App Variants: Set up separate app IDs (e.g., com.myapp.dev and com.myapp) for development and production builds. This allows both versions to be installed on the same physical device simultaneously.

- TDD: Unit test logics of implementation match requirements.

### Architecture and Structure

- Feature-First Organization: Structure your project by features rather than file types (e.g., all auth related files in an auth folder). This enhances modularity, scalability, and code isolation.

- Single Responsibility Principle: Ensure each component, hook, or service performs one task well. This makes code easier to test, maintain, and understand.

- Separate UI and Logic: Keep your screens "dumb" (focused on rendering and navigation) and use custom hooks to encapsulate business logic, making the logic reusable and testable.

- Use Expo Router: Leverage the file-based routing system of Expo Router for navigation and built-in deep linking support.

- Create a Design System: Establish a centralized theme file for colors, spacing, and typography, and build reusable UI components (e.g., Button, Typography) to ensure a consistent look and feel.

- Use Continuous Native Generation (CNG): Configure your project to generate native projects only when needed (by ignoring ios and android folders in Git). This simplifies upgrades and maintenance using config plugins.

### Performance Optimization

- Leverage Automatic Threading: Expo/React Native automatically runs JavaScript on its own thread, separate from the UI thread, ensuring smooth UI performance even during heavy computation.

- Optimize State Management: Minimize unnecessary state updates and use local state when possible.

- Use React Compiler/Memoization: The React Compiler (currently in beta) automatically memoizes components and values, reducing extraneous re-renders. Manually use React.memo(), useMemo, and useCallback if the compiler isn't enabled or for specific cases.

- Optimize Lists: Use performant list components like @shopify/flash-list and configure props like removeClippedSubviews for large data sets.

- Use Native Modules for Heavy Tasks: For performance-intensive tasks (e.g., complex animations), consider using libraries like React Native Reanimated which can use worklets to run JavaScript on the UI thread.

- Use **DEV**: Use the global **DEV** variable to strip out development-only code when bundling for production.

### Distribution and Deployment

- Implement CI/CD: Automate checks (linting, TypeScript) on every push and use EAS Build for continuous delivery of app builds.

- Enable Automatic Build Versioning: Configure your workflow to automatically increment build versions to prevent App Store/Google Play upload failures.

- Build an In-App Upgrade Flow: Since app stores don't have a built-in "force update" mechanism, implement logic within your app to check for and prompt users to install new versions, potentially using Expo Updates for over-the-air (OTA) updates.

- Test on Various Devices: Ensure responsive design by testing on diverse screen sizes and orientations (e.g., iPhone SE, large tablets).
