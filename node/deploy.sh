tar -cf ./deploy.tar --exclude='*.map' ./package.json ./package-lock.json ./captain-definition ./index.js
caprover deploy -t ./deploy.tar -d
rm deploy.tar