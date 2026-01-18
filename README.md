# antares application

# Adding a component to the app

Define the function in

1. database.ts
2. Add the function to the AppDatabase class
3. Add the function to the ipcMain
4. Add the function to the ipcRenderer
5. Add the function to the App component
6. Add the function to the App component

# BUILDING APP

### Build a mac app

```
NODE_ENV=production npm run package:mac -- --universal
```

### Start app

```
npm start
```

### Build a mac app:

```
npm run package:mac
```

### Build for windows

```
NODE_ENV=production npm run build && electron-builder --win --x64
```
