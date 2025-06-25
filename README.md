# NurseryTrack

_NurseryTrack_ — це крос-платформенний мобільний додаток для розсадників та теплиць, який дозволяє вести інвентаризацію рослин, облік партій, історію дій (продажі, пересадки тощо) та фінансову аналітику. Розроблений на React Native із використанням Firebase (Firestore, Authentication, Storage).

## Особливості

- **Авторизація** (рольова: адміністратор та працівник)
- **Інвентаризація**: сорти, партії, деталі партії
- **Історія дій**: логування продажів, пересадок тощо
- **Генерація/сканування QR-кодів** для партій
- **Завантаження фото** (Firebase Storage)
- **Фінансові звіти** (графіки, таблиці)
- **Підтримка офлайн-режиму** (Firestore persistence)
- **Безпека**: Firestore security rules

## Технології

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- [React Navigation](https://reactnavigation.org/)
- [react-native-paper](https://callstack.github.io/react-native-paper/)
- [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg)
- [victory-native](https://formidable.com/open-source/victory/docs/native/) (графіки)

## Структура проекту

```
NurseryTrack/
├── App.js
├── firebase.js
├── package.json
├── navigation/
│   ├── AppNavigator.js
│   └── BottomTabNavigator.js
├── screens/
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── ReportsScreen.js
│   ├── ProfileScreen.js
│   ├── AddActionModal.js
│   ├── ScanQRScreen.js
│   └── Inventory/
│       ├── VarietiesListScreen.js
│       ├── VarietiesCRUDScreen.js
│       ├── BatchesListScreen.js
│       ├── BatchDetailScreen.js
│       ├── AddBatchScreen.js
│       └── BatchPhotoUploadScreen.js
├── components/
│   ├── QRCodeComponent.js
│   └── PhotoGallery.js
├── utils/
│   └── firestoreModels.js
└── firestore.rules
```

## Запуск проекту

1. **Клонувати репозиторій:**
    ```bash
    git clone https://github.com/yourusername/NurseryTrack.git
    cd NurseryTrack
    ```

2. **Встановити залежності:**
    ```bash
    npm install
    ```

3. **Створити Firebase-проект:**
    - Зареєструйте проект у [Firebase Console](https://console.firebase.google.com/).
    - Додайте ключі в `firebase.js`.

4. **Налаштувати Firestore rules:**
    - Скопіюйте `firestore.rules` у консоль Firestore.

5. **Запустити додаток:**
    ```bash
    npm start
    ```
    або
    ```bash
    expo start
    ```

## Ліцензія

MIT

## Автор

[Lumeo-sd](https://github.com/Lumeo-sd)
