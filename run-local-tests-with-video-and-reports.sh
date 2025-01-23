#!/bin/bash

echo "run tests with video recording enabled"
npx playwright test --headed --project=chromium

echo "how report after running tests:"
npx playwright show-report
