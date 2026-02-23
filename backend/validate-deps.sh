#!/bin/sh
npm ls express-validator
if [ $? -ne 0 ]; then
  echo "ERROR: express-validator is missing from dependencies!"
  exit 1
fi
