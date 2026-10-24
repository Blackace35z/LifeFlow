# LifeFlow — Personal Life & Finance Dashboard

LifeFlow is a personal productivity and finance dashboard built to help users organize their daily tasks, manage their budgets, and track progress toward their goals in one place.

## Features

- **Dashboard:** Get an overview of your tasks, budget, and goals.
- **Daily Planner:** Create, organize, complete, and delete tasks. Set dates, times, categories, and priorities.
- **Budget Tracker:** Record income and expenses and view monthly financial totals.
- **Goal Tracking:** Create goals, set deadlines, and monitor progress.
- **Dark & Light Themes:** Switch between themes based on your preference.
- **Local Data Persistence:** Save app data in the browser using local storage.
- **Responsive Interface:** Use a clean, modern layout designed for different screen sizes.
- **Tunisian Dinar (TND):** Display financial amounts in TND.

## Screenshots

<!-- Add 2-3 screenshots to docs/screenshots/ and link them here, for example: -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Browser Local Storage

## Getting Started

Follow these steps to run LifeFlow locally.

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Blackace35z/LifeFlow.git
   ```

2. Navigate into the project directory:

   ```bash
   cd LifeFlow
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in your terminal.

### Production Build

To check and build the app for production, run:

```bash
npm run build
```

To preview the production build locally, run:

```bash
npm run preview
```

## Data Storage

LifeFlow currently uses browser local storage to persist app data. This means saved data is associated with the browser and device being used. The current project does not provide cloud synchronization or a shared account system.

## Project Status

LifeFlow is an ongoing personal project focused on productivity, budgeting, and goal management. Features and the interface may evolve as development continues.

## Future Improvements

Potential improvements include:

- User accounts and cloud synchronization
- Data export and import
- More detailed spending analytics
- Additional productivity insights
- Deployment as a publicly accessible web app

## Author

**GitHub:** [Blackace35z](https://github.com/Blackace35z)

## License

Released under the [MIT License](LICENSE).
