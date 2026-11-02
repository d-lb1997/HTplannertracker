# HT Discovery plan and tracker

`index.html` is the published page. The two trackers are encrypted inside it
(AES-256-GCM, key from PBKDF2) and only decrypted in the browser after the
correct password is entered.

Source lives in `src/`. After editing anything there, rebuild:

    HT_PASSWORD='<password>' node tools/build-protected.js

Cross-workstream task links are defined in `tools/build-deps.js`.
