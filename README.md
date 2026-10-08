SETUP FOR TEAM

*git clone -b backup-working-version 
https://github.com/vetalaakaru/RondaWatch.git

*cd RondaWatch

*npm install

*cp .env.example .env

*nano .env

*npx expo install expo-dev-client

*eas build --profile development --platform android

*npx expo start --dev-client


###Note: RondaWatch is configured to run using an Expo Development Client. Expo Go is not supported for this project.###
