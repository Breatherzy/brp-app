# **Dokumentacja zmian - Breath research project**

## [Dokumentacja techniczna](https://drive.google.com/drive/folders/1f0GzATS1l17tGDGbZQMPBjkeFvcuOTfD?usp=sharing)

## [BRP-APP-FIRST](https://github.com/rysiekpol/breath_research_project)

## [BRP-APP-OLD](https://github.com/rysiekpol/multiplatform_breath_research_project)

## [BRP-APP](https://github.com/Breatherzy/brp-app)

## [BRP-2-connect-screen](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/1)

### **Opis zmiany**

Dodanie ekranu odpowiadającego za łączenie z czujnikami.

### **Edytowane pliki**

- App.tsx
- ChartsScreen.tsx
- ConnectScreen.tsx

### **Bibilioteki**

- react-native-charts-wrapper
- react-native-pager-view
- react-native-tab-view

---

## [BRP-3-charts-screen](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/2)

### **Opis zmiany**

Dodanie ekranu odpowiadającego za wyświetlanie wykresu.

### **Edytowane pliki**

- ChartsScreen.tsx

### **Bibilioteki**

- react-native-charts-wrapper

---

## [BRP-4-statistic-screen](https://github.com/Breatherzy/brp-app/pull/1/files)

### **Opis zmiany**

Dodanie ekranu zawierającego statystyki.

### **Edytowane pliki**

- App.tsx
- UserDataContext.tsx
- useUserData.tsx
- ChartsScreen.tsx
- StatisticScreen.tsx

---

## [BRP-7-ble-backend](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/3)

### **Opis zmiany**

Połączenie aplikacji z czujnikami.

### **Edytowane pliki**

- App.tsx
- AccelerometerDataContext.tsx
- TensometerDataContext.tsx
- useAccelerometerData.tsx
- useTensometerData.tsx
- ChartsScreen.tsx
- ConnectScreen.tsx

### **Bibilioteki**

- react-native-ble-manager

---

## [BRP-11-charts-backend](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/4)

### **Opis zmiany**

Połączenie danych pobieranych z czujników z wykresem wyświetlanym na ekranie, oraz dodanie średniej kroczącej na pobieranych danych.

### **Edytowane pliki**

- ChartsScreen.tsx

---

## [BRP-9-add-python-ios](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/5)

### **Opis zmiany**

Dodanie sieci neuronowej do aplikacji na systemie IOS.

### **Edytowane pliki**

- MLBridge.h
- MLBridge.m
- MLBridge.swift
- Podfile.lock
- CoreMLModule.js
- ChartsScreen.tsx
- ConnectScreen.tsx

---

## [BRP-8-add-neural-network-model-to-android](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/6)

### **Opis zmiany**

Dodanie sieci neuronowej i jej obsługa na systemie Android.

### **Edytowane pliki**

- BRPAppPackage.java
- MainApplication.java
- TFLiteModule.java
- App.tsx
- NeuralNetworkModel.js
- ChartsScreen.tsx
- ConnectScreen.tsx

### **Bibilioteki**

- tensorflow
- leakcanary-android
- react-native-fast-tflite
- react-native-safe-area-context
- react-native-screens
- babel-plugin-transform-remove-console

---

## [BRP-5-demo-version](https://github.com/rysiekpol/multiplatform_breath_research_project/pull/7)

### **Opis zmiany**

Dodanie wersji demo umozliowiającej testowanie bez połączenia z czujnikami.

### **Edytowane pliki**

- MainApplication.java
- ChartsScreen.tsx

### **Bibilioteki**

- react-native-fs

---

## [BRP-18-repair-demo-version](https://github.com/Breatherzy/brp-app/pull/2)

### **Opis zmiany**

Naprawianie problemów związanych z memory leakiem.

### **Edytowane pliki**

- ConnectScreen.tsx
- ChartsScreen.tsx
- useTensometerData.tsx
- useAccelerometerData.
- TensometerDataContext.tsx

---

## [brp-36-fix-colors-and-improve-debug-version-fix-accelerometer](https://github.com/Breatherzy/brp-app/pull/3)

### **Opis zmiany**

Naprawienie wyświetlania kolorów oraz parsowania danych pobieranych z akcelerometru.

### **Edytowane pliki**

- ConnectScreen.tsx
- ChartsScreen.tsx

---

## [brp-37-add-gemfilelock-package-lockjson-and-yarnlock-to-gitignore](https://github.com/Breatherzy/brp-app/pull/4)

### **Opis zmiany**

Dodanie gemifilelock oraz lockjson do gitignore.

### **Edytowane pliki**

- .gitignore

---

## [Update app to Android 13 and react-native to 0.72.6](https://github.com/Breatherzy/brp-app/pull/5)

### **Opis zmiany**

Podbicie wersji Androida do 13.0 oraz ReactNative do 0.72.6
Aby to zrobić aplikacja zostala postawiona na nowo dla podanych wersji.

### **Edytowane pliki**

- AndroidManifest.xml

---

## [BRP-44-finish-frontend-look-of-an-app](https://github.com/Breatherzy/brp-app/pull/6)

### **Opis zmiany**

Zmiana wielkości czcionki w zalezności od wielkości pól tekstowych. Zmiana ikony aplikacji.

### **Edytowane pliki**

- ChartsScreen.tsx
- StatisticScreen.tsx

---

## [brp-46-add-4th-screen-changing-ml-model](https://github.com/Breatherzy/brp-app/pull/7)

### **Opis zmiany**

Dodanie czwartego ekranu odpowiadającego za zmiane rodzajów modeli oraz ich ustawień.

### Dostępne ustawiania i modele:

- Model dwustanowy (wdech, wydech)
- Model trzystanowy (wdech, bezdech, wydech)
- State model (stan oddechu)
- Mono-model (zmiany monotoniczności)

### **Edytowane pliki**

- TFLiteModule.java
- package.json
- App.tsx
- NeuralNetworkModel.js
- ChartsScreen.tsx
- ConnectScreen.tsx
- SettingsScreen.tsx
- StatisticScreen.tsx

### **Bibilioteki**

- react-native-keep-awake

---

## [brp-48-connect-inode-to-app](https://github.com/Breatherzy/brp-app/pull/8)

### **Opis zmiany**

Dodanie obsługi akcelerometru iNode Nav oraz zablokowanie obrotu ekranu.

### **Edytowane pliki**

- AndroidManifest.xml
- ChartsScreen.tsx
- ConnectScreen.tsx

---

## [BRP-49-ml-model-based-on-random-forest-transfer-labelling](https://github.com/Breatherzy/brp-app/pull/9)

### **Opis zmiany**

Dodanie nowego modelu sieci wytrenowanego na bazie danych zaklasyfikowanych przez Lasy Losowe.

### **Edytowane pliki**

- App.tsx
- ChartsScreen.tsx
- SettingsScreen.tsx

---

## [BRP-52-accelerometer-ml-model](https://github.com/Breatherzy/brp-app/pull/10)

### **Opis zmiany**

Dodanie modelu sieci neuronowej obsługującej dane z akcelerometru.

### **Edytowane pliki**

- App.tsx
- NeuralNetworkModel.tsx
- ChartsScreen.tsx
- TFLiteModuleJava.java

---

## [BRP-57-saving-incoming-data-from-sensors-to-file](https://github.com/Breatherzy/brp-app/pull/11)

### **Opis zmiany**

Dodanie automatycznego zapisaywania pomiarów do pliku tekstowego. Dodanie dokumentacji do repozytorium projektu.

### **Edytowane pliki**

- /docs/...
- App.tsx
- ChartsScreen.tsx
- ConnectScreen.java
- AndroidManifest.xml

---

## [brp-debug-plot](https://github.com/Breatherzy/brp-debug-plot)

## [BRP-19-add-data-for-no-breath](https://github.com/Breatherzy/brp-debug-plot/pull/1)

### **Opis zmiany**

Odczytywanie danych z plików.

### **Edytowane pliki**

- main.py

### **Bibilioteki**

- contourpy==1.1.1
- matplotlib==3.8.0
- numpy==1.26.0
- ## Pillow==10.0.1

## [BRP-19-add-data-for-no-breath](https://github.com/Breatherzy/brp-debug-plot/pull/3)

### **Opis zmiany**

Dodanie klasyfikatorów (automatycznych oraz manualnych) danych. Dodanie funkcji rysujących dane zaklasyfikowane.

### **Edytowane pliki**

- categorise_automatically.py
- categorise_manually.py
- load_data.py
- normalization.py
- plot.py

---

## [brp-ml-model](https://github.com/Breatherzy/brp-ml-model)

## [brp-16-implement-transfer-ml-model](https://github.com/Breatherzy/brp-ml-model/pull/1)

### **Opis zmiany**

Dodanie skryptu uczącego lasy losowe na danych po uprzedniej klasyfikacji i normalizacji.

### **Edytowane pliki**

- archived/...
- bezdech_model.py
- wdech_wydech_model.py
- zatrzymanie_model.py

### **Bibilioteki**

- keras==2.14.0
- Markdown==3.5.1
- ml-dtypes==0.2.0
- numpy==1.26.1
- tensorboard==2.14.1
- tensorboard-data-server==0.7.2
- tensorflow==2.14.0
- tensorflow-estimator==2.14.0
- tensorflow-io-gcs-filesystem==0.34.0
- tensorflow-macos==2.14.0
- matplotlib==3.8.2

---

## [brp-data-labelling](https://github.com/Breatherzy/brp-data-labelling)

## [BRP-59-add-data-labelling-script](https://github.com/Breatherzy/brp-data-labelling/pull/1)

### **Opis zmiany**

Dodanie skryptu do ręcznej analizy danych oraz ich klasyfikacja. Skrypt tworzy interaktywny wykres z możliwością zaznaczania niepoprawnie sklasyfikowanych obszarów.

### **Edytowane pliki**

- labelling.py
- docker-compose.yml
- start.sh

### **Bibilioteki**

- numpy==1.26.1
- matplotlib==3.8.2
- pandas==2.1.4
