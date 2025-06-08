# electron-sample-todo

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
