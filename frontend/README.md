# 🐝 Habee Frontend – React Native App (Expo)

This is the mobile frontend for **Habee**, a sleek and purposeful habit-tracking app inspired by the focus and rhythm of worker bees. Built with **React Native** using **Expo**, it allows users to log, track, and visualize daily habits with ease.

---

## ⚙️ Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **Axios** for API requests
- **expo-secure-store** for JWT token storage
- **react-navigation** for routing
- **Custom reusable components** (e.g., habit grid, modals, headers)

---

## 🚀 Getting Started

### 1. `cd` into the frontend directory

```bash
cd habee-app/frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in `/frontend`:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5050/api
```

Replace the IP address with your local backend server IP.

If needed, create a type declaration:

```ts
// types/env.d.ts
declare module "@env" {
  export const EXPO_PUBLIC_API_URL: string;
}
```

---

## 📱 Running the App

Start the Expo development server:

```bash
npx expo start
```

- Scan the QR code in your terminal or browser using the **Expo Go** app (iOS/Android)
- Or open the app in an **emulator/simulator**

To clear cache:

```bash
npx expo start -c
```

---

## 🗂️ Folder Structure

```
/screens/       → Page-level components (Home, Calendar, etc.)
/components/    → Reusable UI components
/lib/           → API logic, utilities, date helpers
/assets/        → Icons, splash screen, images
```

---

## 🔐 Auth & API

- JWT is stored securely using `expo-secure-store`
- Axios interceptor auto-injects token for authenticated requests
- Base URL is set via `.env` and imported using `@env`

---

## 🌐 Notes

- Uses black/yellow color theme and bee-inspired branding
- Splash screen and app icon to be added soon
- Backend must be running locally or remotely for full functionality

---

## 🧪 Testing

Coming soon (MVP first!)

---
